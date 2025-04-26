import { injectable } from "inversify";
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
	ForbiddenError,
} from "./factory.response";

@injectable()
export class Http {
	badRequest(message = "Bad Request") {
		return new BadRequestError(message);
	}

	notFound(message = "Not Found") {
		return new NotFoundError(message);
	}

	unauthorized(message = "Unauthorized") {
		return new UnauthorizedError(message);
	}

	forbidden(message = "Forbidden") {
		return new ForbiddenError(message);
	}
}
