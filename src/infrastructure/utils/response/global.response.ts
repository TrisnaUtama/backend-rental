import { BaseHttpError } from "./base.response";
import { StandardResponse } from "./standard.response";
import { Logger } from "../../entity/logger";

const logger = new Logger();

export class GlobalErrorHandler {
	static handleError(error: any, set: any) {
		if (error instanceof BaseHttpError) {
			logger.warn(error);
			set.status = error.statusCode;
			return StandardResponse.error(error.message, error.statusCode);
		}

		set.status = 500;
		logger.error(error);
		return StandardResponse.error("Internal server error", 500);
	}
}
