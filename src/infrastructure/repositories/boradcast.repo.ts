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
			const broadcasts = await this.prisma.notification_Broadcast.findMany();
			return broadcasts;
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
			const broadcast = await this.prisma.notification_Broadcast.findUnique({
				where: {
					id,
				},
			});
			return broadcast;
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateNotificationBroadcast) {
		try {
			const create_broadcast = await this.prisma.notification_Broadcast.create({
				data: payload,
			});

			return create_broadcast;
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
			const updated_broadcast = await this.prisma.notification_Broadcast.update(
				{ where: { id }, data: payload },
			);
			return updated_broadcast;
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
