import { BaseHttpError } from "./base.response";

export class NotFoundError extends BaseHttpError {
	constructor(message = "Resource not found") {
		super(message, 404);
	}
}

export class BadRequestError extends BaseHttpError {
	constructor(message = "Bad Request") {
		super(message, 400);
	}
}

export class UnauthorizedError extends BaseHttpError {
	constructor(message = "Unauthorized") {
		super(message, 401);
	}
}

export class ForbiddenError extends BaseHttpError {
	constructor(message = "Forbidden") {
		super(message, 403);
	}
}
