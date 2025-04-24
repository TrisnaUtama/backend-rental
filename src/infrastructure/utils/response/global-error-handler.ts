import { UnauthorizedError } from "./unauthorized";
import { BadRequestError } from "./bad-request.error";
import { NotFoundError } from "./not-found.error";
import { StandardResponse } from "./standard-error";
import { ForbiddenError } from "./forbidden.error";

export class GlobalErrorHandler {
	static handleError(error: unknown, set: any) {
		if (error instanceof BadRequestError) {
			set.status = 400;
			return StandardResponse.error(error.message, 400);
		}

		if (error instanceof NotFoundError) {
			set.status = 404;
			return StandardResponse.error(error.message, 404);
		}

		if (error instanceof UnauthorizedError) {
			set.status = 401;
			return StandardResponse.error(error.message, 401);
		}

		if (error instanceof ForbiddenError) {
			set.status = 403;
			return StandardResponse.error(error.message, 403);
		}

		if (error instanceof Error) {
			set.status = 500;
			return StandardResponse.error(error.message, 500);
		}
		return StandardResponse.error("Internal server error", 500);
	}
}
