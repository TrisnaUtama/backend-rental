export class StandardResponse {
	static success<T>(data: T, message = "Success", meta: any = null) {
		return {
			success: true,
			message,
			data,
			meta,
		};
	}

	static error(
		message = "Something went wrong",
		statusCode = 500,
		errors: any = null,
	) {
		return {
			success: false,
			message,
			statusCode,
			errors,
		};
	}
}
