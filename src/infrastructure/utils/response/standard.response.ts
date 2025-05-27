export class StandardResponse {
	static success<T>(data: T, message = "Success") {
		return {
			success: true,
			message,
			data,
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

	static login<T>(data: T, access_token: string, message = "Success") {
		return {
			success: true,
			message,
			data,
			access_token,
		};
	}
}
