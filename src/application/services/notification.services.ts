import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { NotificationRepository } from "./../../infrastructure/repositories/notification.repo";
import {
	type CreateNotification,
	TYPES,
	type UpdateNotification,
} from "../../infrastructure/entity/types";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";

@injectable()
export class NotificationService {
	private notificationRepo: NotificationRepository;
	private errorHandler: ErrorHandler;
	private response: Http;

	constructor(
		@inject(TYPES.notificationRepo) notificationRepo: NotificationRepository,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
	) {
		this.notificationRepo = notificationRepo;
		this.errorHandler = errorHandler;
		this.response = response;
	}

	async getAll() {
		try {
			const notifications = await this.notificationRepo.getAll();
			if (notifications.length === 0) {
				throw this.response.badRequest("Notifications is empty !");
			}
			return notifications;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const notification = await this.notificationRepo.getOne(id);
			if (!notification) {
				throw this.response.notFound("Notification not found !");
			}
			return notification;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateNotification) {
		try {
			const new_notification = await this.notificationRepo.create(payload);
			if (!new_notification) {
				throw this.response.badRequest("Error while creating notification");
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
				throw this.response.notFound("Notification not found");
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
