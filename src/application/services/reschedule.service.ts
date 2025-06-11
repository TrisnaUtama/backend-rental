import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import {
	TYPES,
	type CreateResheduleRequest,
	type UpdateRescheduleRequest,
} from "../../infrastructure/entity/types";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { RescheduleRepostitory } from "../../infrastructure/repositories/reschedule.repo";

@injectable()
export class RescheduleService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private rescheduleRepo: RescheduleRepostitory;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.rescheduleRepo) rescheduleRepo: RescheduleRepostitory,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.rescheduleRepo = rescheduleRepo;
	}

	async getAll() {
		try {
			const reschedules = await this.rescheduleRepo.getAll();
			if (!reschedules)
				throw this.response.badRequest("Error while getting reschedules");
			return reschedules;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const reschedule = await this.rescheduleRepo.getOne(id);
			if (!reschedule) throw this.response.notFound("reschedule is not found");
			return reschedule;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateResheduleRequest) {
		try {
			const new_reschedule = await this.rescheduleRepo.create(payload);
			if (!new_reschedule)
				throw this.response.badRequest("Error while creating new reschedule");
			return new_reschedule;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateRescheduleRequest) {
		try {
			const exists_reschedule = await this.rescheduleRepo.getOne(id);
			if (!exists_reschedule)
				throw this.response.notFound("reschedule not found");

			const updated_reschedule = await this.rescheduleRepo.update(id, payload);
			if (!updated_reschedule)
				throw this.response.badRequest(
					`Error while updating reschedule with id ${id}`,
				);
			return updated_reschedule;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
