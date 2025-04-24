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
	private errorHanlder: ErrorHandler;

	constructor(
		@inject(TYPES.error_handler) errorHandler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.prisma = prisma;
		this.errorHanlder = errorHandler;
	}

	async getAll() {
		try {
			const notifications = await this.prisma.notifications.findMany({
				where: { status: true },
			});
			return notifications;
		} catch (error) {
			this.errorHanlder.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			const notification = await this.prisma.notifications.findFirst({
				where: {
					id,
				},
			});

			return notification;
		} catch (error) {
			this.errorHanlder.handleRepositoryError(error);
		}
	}

	async create(payload: CreateNotification) {
		try {
			const new_notification = await this.prisma.notifications.create({
				data: payload,
			});
			return new_notification;
		} catch (error) {
			this.errorHanlder.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateNotification) {
		try {
			const update_notification = await this.prisma.notifications.update({
				where: { id },
				data: payload,
			});
			return update_notification;
		} catch (error) {
			this.errorHanlder.handleRepositoryError(error);
		}
	}

	async delete(id: string) {
		try {
			await this.prisma.notifications.delete({ where: { id } });
		} catch (error) {
			this.errorHanlder.handleRepositoryError(error);
		}
	}
}
