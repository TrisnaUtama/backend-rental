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
		@inject(TYPES.error_handler) error_handler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.prisma = prisma;
		this.error_handler = error_handler;
	}

	async getAll() {
		try {
			const otps = this.prisma.oTPs.findMany();
			return otps;
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			const otp = this.prisma.oTPs.findFirst({
				where: {
					user_id: id,
				},
			});
			return otp;
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async create(data: CreateOTP) {
		try {
			const otp = this.prisma.oTPs.create({
				data,
			});
			return otp;
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async update(id: string, data: UpdateOTP) {
		try {
			const updatedOtp = this.prisma.oTPs.update({
				where: {
					id,
				},
				data,
			});

			return updatedOtp;
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async delete(id: string) {
		try {
			this.prisma.oTPs.delete({
				where: {
					id,
				},
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}
}
