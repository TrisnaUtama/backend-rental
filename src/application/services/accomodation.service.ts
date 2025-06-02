import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import {
	TYPES,
	type CreateAccomodation,
	type UpdateAccomodation,
} from "../../infrastructure/entity/types";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { AccomodationRepostitory } from "../../infrastructure/repositories/accomodation.repo";

@injectable()
export class AccomodationService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private accomodationRepo: AccomodationRepostitory;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.accomodationRepo) accomodationRepo: AccomodationRepostitory,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.accomodationRepo = accomodationRepo;
	}

	async getAll() {
		try {
			const accomodations = await this.accomodationRepo.getAll();
			if (!accomodations)
				throw this.response.badRequest("Error while getting accomodations");
			return accomodations;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const accomodation = await this.accomodationRepo.getOne(id);
			if (!accomodation)
				throw this.response.notFound("accomodation is not found");
			return accomodation;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateAccomodation) {
		try {
			const new_accomodation = await this.accomodationRepo.create(payload);
			if (!new_accomodation)
				throw this.response.badRequest("Error while creating new accomodation");
			return new_accomodation;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateAccomodation) {
		try {
			const exist_accomodation = await this.accomodationRepo.getOne(id);
			if (!exist_accomodation)
				throw this.response.notFound("accomodation not found");

			const updated_accomodation = await this.accomodationRepo.update(
				id,
				payload,
			);
			if (!updated_accomodation)
				throw this.response.badRequest(
					`Error while updating accomodation with id ${id}`,
				);
			return updated_accomodation;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async delete(id: string) {
		try {
			const exist_accomodation = await this.accomodationRepo.getOne(id);
			if (!exist_accomodation)
				throw this.response.notFound("accomodation not found");

			return await this.accomodationRepo.update(id, {
				status: false,
			});
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
