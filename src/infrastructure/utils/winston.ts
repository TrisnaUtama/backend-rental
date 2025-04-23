import winston from "winston";
import moment from "moment-timezone";

const { combine, errors, printf } = winston.format;

const customLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		debug: 3,
	},
	colors: {
		error: "red",
		warn: "yellow",
		info: "green",
		debug: "blue",
	},
};

winston.addColors(customLevels.colors);

const consoleFormat = combine(
	winston.format.colorize(),
	errors({ stack: true }),
	printf(({ level, message, stack }) => {
		const time = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
		return `${time} [${level}]: ${message}${stack ? `\n${stack}` : ""}`;
	}),
);

const fileFormat = combine(
	errors({ stack: true }),
	winston.format.timestamp({
		format: () => moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
	}),
	winston.format.json(),
);

const transports =
	process.env.NODE_ENV === "production"
		? [
				new winston.transports.File({
					filename: "logfile.log",
					format: fileFormat,
				}),
			]
		: [
				new winston.transports.Console({
					format: consoleFormat,
				}),
			];

const logger = winston.createLogger({
	level: "debug",
	levels: customLevels.levels,
	transports: transports,
});

export default logger;
