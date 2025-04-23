import type { ILogger } from "./interfaces";
import logger from "../utils/winston";

export class Logger implements ILogger {
	info(message: string | Error) {
		logger.info(typeof message === "string" ? message : message.message);
	}
	warn(message: string | Error) {
		logger.warn(typeof message === "string" ? message : message.message);
	}
	error(message: string | Error) {
		logger.error(typeof message === "string" ? message : message.message);
	}
}
