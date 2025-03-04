import mongoose from "mongoose";
import envConfig from "../utils/envConfig";
import logger from "../../logger";

const connectToDb = async () => {
	mongoose
		.connect(envConfig.mongoURI as string, {
			maxPoolSize: 20,
		})
		.then(() => {
			logger.info("Database connected successfully");
		})
		.catch((err) => {
			logger.error(err, "<<-- Error in connecting with database");
		});
};

export default connectToDb;
