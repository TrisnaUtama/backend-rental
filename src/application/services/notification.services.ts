import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { NotificationRepository } from "./../../infrastructure/repositories/notification.repo";
import {
	type CreateNotification,
	TYPES,
	type UpdateNotification,
} from "../../infrastructure/entity/types";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import { NotFoundError } from "../../infrastructure/utils/response/not-found.error";
import { BadRequestError } from "../../infrastructure/utils/response/bad-request.error";

@injectable()
export class NotificationService {
	private notificationRepo: NotificationRepository;
	private errorHandler: ErrorHandler;

	constructor(
		@inject(TYPES.notificationRepo) notificationRepo: NotificationRepository,
		@inject(TYPES.error_handler) errorHandler: ErrorHandler,
	) {
		this.notificationRepo = notificationRepo;
		this.errorHandler = errorHandler;
	}

	async getAll() {
		try {
			return await this.notificationRepo.getAll();
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.notificationRepo.getOne(id);
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateNotification) {
		try {
			const new_notification = await this.notificationRepo.create(payload);
			if (!new_notification) {
				throw new BadRequestError("Error while creating notification");
			}
			return new_notification;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateNotification) {
		try {
			const notification = await this.notificationRepo.getOne(id);
			if (!notification) {
				throw new NotFoundError("Notification not found");
			}

			const updated_notification = await this.notificationRepo.update(
				id,
				payload,
			);
			return updated_notification;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async delete(id: string) {
		try {
			const notification = await this.notificationRepo.getOne(id);
			await this.notificationRepo.update(id, {
				...notification,
				status: false,
			});
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
