import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { PromoRepository } from "./../../infrastructure/repositories/promo.repo";
import {
	TYPES,
	type CreatePromo,
	type UpdatePromo,
} from "../../infrastructure/entity/types";
import type { Http } from "../../infrastructure/utils/response/http.response";

@injectable()
export class PromoService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private promoRepo: PromoRepository;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.promoRepo) promoRepo: PromoRepository,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.promoRepo = promoRepo;
	}

	async getAll() {
		try {
			const promos = await this.promoRepo.getAll();
			if (!promos) throw this.response.badRequest("Error while getting promos");
			return promos;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const promo = await this.promoRepo.getOne(id);
			if (!promo) throw this.response.notFound("Promo is not found");
			return promo;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreatePromo) {
		try {
			const new_promo = await this.promoRepo.create(payload);
			if (!new_promo)
				throw this.response.badRequest("Error while creating new promo");
			return new_promo;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdatePromo) {
		try {
			const exist_promo = await this.promoRepo.getOne(id);
			if (!exist_promo) throw this.response.notFound("Promo not found");

			const updated_promo = await this.promoRepo.update(id, payload);
			if (!updated_promo)
				throw this.response.badRequest(
					`Error while updating promo with id ${id}`,
				);
			return updated_promo;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async delete(id: string) {
		try {
			const exist_promo = await this.promoRepo.getOne(id);
			if (!exist_promo) throw this.response.notFound("Promo not found");

			return await this.promoRepo.update(id, {
				...exist_promo,
				status: "UNACTIVE",
			});
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
