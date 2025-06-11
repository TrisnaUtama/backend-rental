import type { CreateRefund, UpdateRefund } from "./../entity/types";
import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IRefund } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { PrismaClient } from "@prisma/client";
import { TYPES } from "../entity/types";

type PrismaTransactionClient = Omit<
	PrismaClient,
	"$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

@injectable()
export class RefundRepository implements IRefund {
	private prisma: PrismaClient;
	private errorHandler: ErrorHandler;

	constructor(
		@inject(TYPES.prisma) prisma: PrismaClient,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
	) {
		this.errorHandler = errorHandler;
		this.prisma = prisma;
	}

	async getAll(tx?: PrismaTransactionClient) {
		try {
			const client = tx || this.prisma;
			return await client.refunds.findMany();
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string, tx?: PrismaTransactionClient) {
		try {
			const client = tx || this.prisma;
			return await client.refunds.findUnique({ where: { id } });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateRefund, tx?: PrismaTransactionClient) {
		try {
			const client = tx || this.prisma;
			return await client.refunds.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(
		id: string,
		payload: Partial<UpdateRefund>,
		tx?: PrismaTransactionClient,
	) {
		try {
			const client = tx || this.prisma;
			return await client.refunds.update({
				where: {
					id,
				},
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
