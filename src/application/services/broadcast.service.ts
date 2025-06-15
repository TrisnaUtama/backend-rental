import "reflect-metadata";
import { injectable, inject } from "inversify";
import {
	type CreateNotification,
	type CreateNotificationBroadcast,
	TYPES,
} from "../../infrastructure/entity/types";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { UserRepository } from "../../infrastructure/repositories/user.repo";
import type { BroadcastRepository } from "../../infrastructure/repositories/boradcast.repo";
import type { EmailService } from "../../infrastructure/entity/email";
import type { NotificationRepository } from "../../infrastructure/repositories/notification.repo";
import type { PromoRepository } from "../../infrastructure/repositories/promo.repo";

@injectable()
export class BroadcastService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private userRepo: UserRepository;
	private broadcastRepo: BroadcastRepository;
	private notificationRepo: NotificationRepository
	private promoRepo: PromoRepository
	private emailService: EmailService;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.userRepo) userRepo: UserRepository,
		@inject(TYPES.broadcastRepo) broadcastRepo: BroadcastRepository,
		@inject(TYPES.notificationRepo) notificationRepo: NotificationRepository,
		@inject(TYPES.promoRepo) promoRepo: PromoRepository,
		@inject(TYPES.email) emailService: EmailService,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.userRepo = userRepo;
		this.broadcastRepo = broadcastRepo;
		this.emailService = emailService;
		this.notificationRepo = notificationRepo;
		this.promoRepo = promoRepo;
	}

	async getAll() {
		try {
			const broadcasts = await this.broadcastRepo.getAll();
			return broadcasts;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getAllByNotifId(id: string) {
		try {
			const broadcastsById = await this.broadcastRepo.getAllByNotifId(id);
			if (broadcastsById.length === 0)
				throw this.response.notFound("Notification to broadcast not found !");
			return broadcastsById;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async broadcastToSpecificUsers(notification_id: string, user_ids: string[]) {
        try {
            if (user_ids.length === 0) {
                throw this.response.badRequest("User ID list cannot be empty.");
            }

            const broadcastPayload: CreateNotificationBroadcast[] = user_ids.map(
                (userId) => ({
                    notification_id: notification_id,
                    user_id: userId,
                    sent_at: new Date(),
                    read_at: null,
                    status: true,
                }),
            );

            const createdBroadcasts = await this.broadcastRepo.createMany(
                broadcastPayload,
            );
            if (!createdBroadcasts) {
                throw this.response.badRequest(
                    "Error while creating broadcast records.",
                );
            }
            await this.emailService.send_broadcast(notification_id);
            return {
                message: `Promo notification sent successfully to ${createdBroadcasts.count} user(s).`,
                data: createdBroadcasts,
            };
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }

	async sendPromoNotification(
        promoId: string,
        targetUserIds: string[] | "all",
    ) {
        try {
            const promo = await this.promoRepo.getOne(promoId);
            if (!promo) {
                throw this.response.notFound("Promo not found!");
            }
            const notificationPayload: CreateNotification = {
				title: `🎉 Special Promo Just For You: ${promo.code}!`,
				message: promo.description,
				type: "PROMO",
				promo_id: promo.id,
				status: true
			};
            const newNotification = await this.notificationRepo.create(
                notificationPayload,
            );
            if (!newNotification) {
                throw this.response.badRequest(
                    "Failed to create notification content.",
                );
            }
            if (targetUserIds === "all") {
                return await this.broadcastToAll(newNotification.id);
            // biome-ignore lint/style/noUselessElse: <explanation>
            } else {
                return await this.broadcastToSpecificUsers(
                    newNotification.id,
                    targetUserIds,
                );
            }
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }

	async getOne(id: string) {
		try {
			const broadcast = await this.broadcastRepo.getOne(id);
			if (!broadcast) throw this.response.notFound("Broadcast not found !");
			return broadcast;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async createOneBroadcast(payload: CreateNotificationBroadcast) {
		try {
			const broadcast = await this.broadcastRepo.create(payload);
			if (!broadcast) {
				throw this.response.badRequest("Broadcast didnt find !");
			}
			return broadcast;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async broadcastToAll(notification_id: string) {
        try {
            const users = await this.userRepo.getAll();
            if (!users || users.length === 0) {
                throw this.response.notFound("No users found to broadcast to.");
            }

            const user_ids = users.map((user) => user.id);
            return await this.broadcastToSpecificUsers(notification_id, user_ids);
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }
}
