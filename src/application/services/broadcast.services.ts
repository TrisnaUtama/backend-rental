import "reflect-metadata";
import { injectable, inject } from "inversify";
import {
	type CreateNotificationBroadcast,
	TYPES,
} from "../../infrastructure/entity/types";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { UserRepository } from "../../infrastructure/repositories/user.repo";
import type { BroadcastRepository } from "../../infrastructure/repositories/boradcast.repo";
import type { EmailService } from "../../infrastructure/entity/email";

@injectable()
export class BroadcastService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private userRepo: UserRepository;
	private broadcastRepo: BroadcastRepository;
	private emailService: EmailService;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.userRepo) userRepo: UserRepository,
		@inject(TYPES.broadcastRepo) broadcastRepo: BroadcastRepository,
		@inject(TYPES.email) emailService: EmailService,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.userRepo = userRepo;
		this.broadcastRepo = broadcastRepo;
		this.emailService = emailService;
	}

	async getAll() {
		try {
			const broadcasts = await this.broadcastRepo.getAll();
			if (broadcasts.length === 0)
				throw this.response.badRequest("Broadcast is empty !");

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

	async broadcastToAll(id: string) {
		try {
			const users = await this.userRepo.getAll();

			if (!users)
				throw this.response.badRequest("error while retreived all user data");

			const broadcast: CreateNotificationBroadcast[] = users.map((user) => ({
				notification_id: id,
				user_id: user.id,
				sent_at: new Date(),
				read_at: null,
				status: true,
			}));

			const create_broadcast = await this.broadcastRepo.createMany(broadcast);
			if (!create_broadcast)
				this.response.badRequest("Error while creating broadcast notification");

			await this.emailService.send_broadcast(id);
			return create_broadcast;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
