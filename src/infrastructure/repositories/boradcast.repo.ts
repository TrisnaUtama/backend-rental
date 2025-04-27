import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { INotificationBroadcast } from "../entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import type { ErrorHandler } from "../entity/errors/global.error";
import {
	type CreateNotificationBroadcast,
	TYPES,
	type UpdateNotificationBroadcast,
} from "../entity/types";

@injectable()
export class BroadcastRepository implements INotificationBroadcast {
	private prisma: PrismaClient;
	private errorHandler: ErrorHandler;

	constructor(
		@inject(TYPES.prisma) prisma: PrismaClient,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
	) {
		this.prisma = prisma;
		this.errorHandler = errorHandler;
	}

	async getAll() {
		try {
			return await this.prisma.notification_Broadcast.findMany();
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getAllByNotifId(id: string) {
		try {
			const broadcast = await this.prisma.notification_Broadcast.findMany({
				where: { notification_id: id },
			});

			return broadcast;
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.notification_Broadcast.findUnique({
				where: {
					id,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateNotificationBroadcast) {
		try {
			return await this.prisma.notification_Broadcast.create({
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async createMany(payload: CreateNotificationBroadcast[]) {
		try {
			return await this.prisma.notification_Broadcast.createMany({
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateNotificationBroadcast) {
		try {
			return await this.prisma.notification_Broadcast.update({
				where: { id },
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async delete(id: string) {
		try {
			const get_broadcast = await this.prisma.notification_Broadcast.findUnique(
				{
					where: {
						id,
					},
				},
			);
			await this.prisma.notification_Broadcast.update({
				where: { id },
				data: { ...get_broadcast, status: false },
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
