import {
	Kafka,
	Partitioners,
	Producer,
	Consumer,
	logLevel,
	SASLOptions,
} from "kafkajs";

import fs from "fs";
import path from "path";
import logger from "../../logger";
import MessagesModel from "../models/MessagesModel";
import envConfig from "../utils/envConfig";

// Singleton instances
let producer: Producer | null = null;
let consumer: Consumer | null = null;

// Kafka configuration
const kafkaConfig = {
	brokers: [`${envConfig.KAFKA_HOST}:${envConfig.KAFKA_PORT}`],
	clientId: "talkify-service",
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
	} as SASLOptions,
	connectionTimeout: 10000, // 10 seconds
	requestTimeout: 30000, // 30 seconds
	retry: {
		initialRetryTime: 100,
		retries: 8,
		maxRetryTime: 30000,
	},
	logLevel: logLevel.ERROR,
};

// Create Kafka instance
const kafka = new Kafka(kafkaConfig);

/**
 * Get or create a producer instance
 * @returns Kafka producer instance
 */
async function getProducer(): Promise<Producer> {
	if (!producer) {
		producer = kafka.producer({
			createPartitioner: Partitioners.DefaultPartitioner,
			allowAutoTopicCreation: true,
			idempotent: true, // Ensures exactly-once delivery
			transactionalId: "talkify-producer-tx",
		});

		// Set up event handlers
		producer.on("producer.connect", () => {
			logger.info("Kafka producer connected");
		});

		producer.on("producer.disconnect", () => {
			logger.warn("Kafka producer disconnected");
		});

		producer.on("producer.network.request_timeout", (payload) => {
			logger.error("Kafka producer request timeout:", payload);
		});

		// Connect to Kafka
		await producer.connect();
	}

	return producer;
}

/**
 * Send a message to Kafka
 * @param message Message to send
 * @param topic Kafka topic (defaults to MESSAGES)
 */
export async function produceMessage(
	message: any,
	topic: string = "MESSAGES"
): Promise<void> {
	try {
		const kafkaProducer = await getProducer();

		// Generate a unique message key
		const messageKey = `message-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 15)}`;

		// Send message to Kafka
		await kafkaProducer.send({
			topic,
			messages: [
				{
					key: messageKey,
					value: JSON.stringify(message),
					headers: {
						source: "talkify-api",
						timestamp: Date.now().toString(),
					},
				},
			],
		});

		logger.debug(`Message sent to Kafka topic ${topic}`);
	} catch (error) {
		logger.error("Failed to produce Kafka message:", error);
		// Don't rethrow to prevent disrupting the application flow
	}
}

/**
 * Start the Kafka consumer
 */
export async function startConsumer(): Promise<void> {
	try {
		logger.info("Starting Kafka consumer...");

		// Create consumer if it doesn't exist
		if (!consumer) {
			consumer = kafka.consumer({
				groupId: envConfig.KAFKA_GROUP_ID || "talkify-group",
				sessionTimeout: 30000,
				heartbeatInterval: 3000,
				maxBytesPerPartition: 1048576, // 1MB
				maxWaitTimeInMs: 5000,
			});

			// Set up event handlers
			consumer.on("consumer.connect", () => {
				logger.info("Kafka consumer connected");
			});

			consumer.on("consumer.disconnect", () => {
				logger.warn("Kafka consumer disconnected");
			});

			consumer.on("consumer.crash", (event) => {
				logger.error("Kafka consumer crashed:", event);
				// Attempt to restart consumer after delay
				setTimeout(() => {
					logger.info("Attempting to restart Kafka consumer...");
					startConsumer().catch((err) => {
						logger.error("Failed to restart Kafka consumer:", err);
					});
				}, 5000);
			});
		}

		// Connect to Kafka
		await consumer.connect();

		// Subscribe to topic
		await consumer.subscribe({
			topic: envConfig.KAFKA_TOPIC || "MESSAGES",
			fromBeginning: false,
		});

		// Start consuming messages
		await consumer.run({
			autoCommit: true,
			autoCommitInterval: 5000,
			autoCommitThreshold: 100,
			eachMessage: async ({ topic, partition, message, heartbeat }) => {
				try {
					// Skip if message has no value
					if (!message.value) {
						logger.warn("Received empty message from Kafka");
						return;
					}

					// Parse message
					const parsedMessage = JSON.parse(message.value.toString());
					logger.debug(
						`Processing message from Kafka topic ${topic}`
					);

					// Periodically send heartbeat to prevent consumer from being kicked out of group
					await heartbeat();

					// Save message to database
					await MessagesModel.create(parsedMessage);

					logger.debug("Message saved to database");
				} catch (error) {
					logger.error("Error processing Kafka message:", error);

					// Pause consumer on error
					if (consumer) {
						consumer.pause([{ topic, partitions: [partition] }]);

						// Resume after delay
						setTimeout(async () => {
							try {
								if (consumer) {
									consumer.resume([
										{ topic, partitions: [partition] },
									]);
									logger.info(
										`Resumed consumer for topic ${topic}, partition ${partition}`
									);
								}
							} catch (resumeError) {
								logger.error(
									"Failed to resume consumer:",
									resumeError
								);
							}
						}, 10000); // 10 seconds
					}
				}
			},
		});
	} catch (error) {
		logger.error("Failed to start Kafka consumer:", error);
		throw error; // Rethrow to allow server to handle startup failure
	}
}

/**
 * Gracefully disconnect Kafka clients
 */
export async function disconnectKafka(): Promise<void> {
	try {
		if (consumer) {
			logger.info("Disconnecting Kafka consumer...");
			await consumer.disconnect();
			consumer = null;
		}

		if (producer) {
			logger.info("Disconnecting Kafka producer...");
			await producer.disconnect();
			producer = null;
		}

		logger.info("Kafka clients disconnected");
	} catch (error) {
		logger.error("Error disconnecting Kafka clients:", error);
	}
}
