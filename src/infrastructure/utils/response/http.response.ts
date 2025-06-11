import { injectable } from "inversify";
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
	ForbiddenError,
} from "./factory.response";
import { Logger } from "../../entity/logger";

const logger = new Logger();

@injectable()
export class Http {
	badRequest(message = "Bad Request") {
		logger.error(message);
		return new BadRequestError(message);
	}

	notFound(message = "Not Found") {
		logger.error(message);
		return new NotFoundError(message);
	}

	unauthorized(message = "Unauthorized") {
		logger.error(message);
		return new UnauthorizedError(message);
	}

	forbidden(message = "Forbidden") {
		logger.error(message);
		return new ForbiddenError(message);
	}
}