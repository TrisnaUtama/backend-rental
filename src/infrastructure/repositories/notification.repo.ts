import { injectable, inject } from "inversify";
import "reflect-metadata";
import type { INotification } from "../entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import {
	type CreateNotification,
	TYPES,
	type UpdateNotification,
} from "../entity/types";
import type { ErrorHandler } from "../entity/errors/global.error";

@injectable()
export class NotificationRepository implements INotification {
	private prisma: PrismaClient;
	private errorHandlder: ErrorHandler;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.prisma = prisma;
		this.errorHandlder = errorHandler;
	}

	async getAll() {
		try {
			return await this.prisma.notifications.findMany({
				where: { status: true },
			});
		} catch (error) {
			this.errorHandlder.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.notifications.findUnique({
				where: {
					id,
				},
			});
		} catch (error) {
			this.errorHandlder.handleRepositoryError(error);
		}
	}

	async create(payload: CreateNotification) {
		try {
			return await this.prisma.notifications.create({
				data: payload,
			});
		} catch (error) {
			this.errorHandlder.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateNotification) {
		try {
			return await this.prisma.notifications.update({
				where: { id },
				data: payload,
			});
		} catch (error) {
			this.errorHandlder.handleRepositoryError(error);
		}
	}
}
