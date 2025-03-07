import { Kafka, Partitioners } from "kafkajs";

import fs from "fs";
import path from "path";
import logger from "../../logger";
import MessagesModel from "../models/MessagesModel";
import envConfig from "../utils/envConfig";

const kafka = new Kafka({
	brokers: [`${envConfig.KAFKA_HOST}:${envConfig.KAFKA_PORT}`],
	ssl: {
		ca: [
			fs.readFileSync(
				path.resolve(__dirname, `${envConfig.KAFKA_CA_FILE_PATH}`),
				"utf8"
			),
		],
	},
	sasl: {
		username: envConfig.KAFKA_USERNAME,
		password: envConfig.KAFKA_PASSWORD,
		mechanism: "plain",
	},
});

export async function produceMessage(message: string) {
	const producer = kafka.producer({
		createPartitioner: Partitioners.DefaultPartitioner,
	});

	await producer.connect();

	await producer.send({
		topic: "MESSAGES",
		messages: [
			{ key: `message-${Date.now()}`, value: JSON.stringify(message) },
		],
	});

	await producer.disconnect();
}

export async function startConsumer() {
	logger.info("Consumer is running!!!");
	const consumer = kafka.consumer({ groupId: "default" });

	await consumer.connect();
	await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

	await consumer.run({
		autoCommit: true,
		eachMessage: async ({ message, pause }) => {
			try {
				if (!message.value) return;

				const parsedMessage = JSON.parse(message.value.toString());

				await MessagesModel.create(parsedMessage);
			} catch (error) {
				logger.error(error, "<<-- Something went wrong!!!");
				pause();

				setTimeout(() => {
					consumer.resume([{ topic: "MESSAGES" }]);
				}, 60 * 1000);
			}
		},
	});
}
