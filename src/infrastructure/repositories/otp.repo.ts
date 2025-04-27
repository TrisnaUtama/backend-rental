import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IOTP } from "../entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import { type CreateOTP, TYPES, type UpdateOTP } from "../entity/types";
import type { ErrorHandler } from "../entity/errors/global.error";

@injectable()
export class OtpRepository implements IOTP {
	private prisma: PrismaClient;
	private error_handler: ErrorHandler;
	constructor(
		@inject(TYPES.errorHandler) error_handler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.prisma = prisma;
		this.error_handler = error_handler;
	}

	async getAll() {
		try {
			return await this.prisma.oTPs.findMany();
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.oTPs.findFirst({
				where: {
					user_id: id,
				},
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async create(data: CreateOTP) {
		try {
			return await this.prisma.oTPs.create({
				data,
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async update(id: string, data: UpdateOTP) {
		try {
			return await this.prisma.oTPs.update({
				where: {
					id,
				},
				data,
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}
}
