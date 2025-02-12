import pino from 'pino';
import pretty from 'pino-pretty';
import envConfig from '../src/utils/envConfig';

const stream = pretty({
    colorize: true, // Colorizes the log output
    translateTime: 'SYS:standard', // Translates the time to a human-readable format
    ignore: 'pid,hostname', // Ignores pid and hostname in the log output
});

const logger = pino(
    {
        level: envConfig.log_level, // Set the log level here
    },
    stream
);

export default logger;
