import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { ILogger } from "../interfaces";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TYPES } from "../types";

@injectable()
export class ErrorHandler {
	private logger: ILogger;
	constructor(@inject(TYPES.logger) logger: ILogger) {
		this.logger = logger;
	}

	public handleRepositoryError(error: unknown): never {
		if (error instanceof PrismaClientKnownRequestError) {
			this.logger.error(error.message);
			throw error;
		}

		if (error instanceof Error) {
			throw error;
		}

		this.logger.error(error as string);
		throw new Error(error as string);
	}

	public handleServiceError(error: unknown): never {
		if (error instanceof Error) {
			throw error;
		}

		this.logger.error(error as string);
		throw new Error(error as string);
	}
}
