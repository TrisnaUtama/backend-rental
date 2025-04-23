import { StandardResponse } from "./standard-error";

export class GlobalErrorHandler {
	static handleError(error: unknown, set: any) {
		set.status = 500;
		if (error instanceof Error) {
			return StandardResponse.error(error.message, 500);
		}
		return StandardResponse.error("Internal server error", 500);
	}
}
