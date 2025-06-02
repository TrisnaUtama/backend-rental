import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IPayments } from "../entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import type { ErrorHandler } from "../entity/errors/global.error";
import { type CreatePayment, TYPES, type UpdatePayment } from "../entity/types";

@injectable()
export class PaymentRepository implements IPayments {
	private prisma: PrismaClient;
	private errorHandler: ErrorHandler;

	constructor(
		@inject(TYPES.prisma) prisma: PrismaClient,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
	) {
		this.prisma = prisma;
		this.errorHandler = errorHandler;
	}

	async getOne(id: string) {
		try {
			return await this.prisma.payments.findFirst({
				where: { id },
				include: {
					booking: {
						include: {
							travel_package: {
								include: {
									pax_options: true,
								},
							},
							booking_vehicles: true,
						},
					},
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getAll() {
		try {
			return await this.prisma.payments.findMany();
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreatePayment) {
		try {
			return await this.prisma.payments.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdatePayment) {
		try {
			return await this.prisma.payments.update({
				where: { id },
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
