import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import {
    TYPES,
    type CreateRating,
    type UpdateRating,
} from "../../infrastructure/entity/types";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { RatingRepostitory } from "../../infrastructure/repositories/rating.repo";

@injectable()
export class RatingService {
    private errorHandler: ErrorHandler;
    private response: Http;
    private ratingRepo: RatingRepostitory;

    constructor(
        @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
        @inject(TYPES.http) response: Http,
        @inject(TYPES.ratingRepo) ratingRepo: RatingRepostitory,
    ) {
        this.errorHandler = errorHandler;
        this.response = response;
        this.ratingRepo = ratingRepo;
    }

    async getAll() {
        try {
            const ratings = await this.ratingRepo.getAll();
            if (!ratings) throw this.response.badRequest("Error while getting ratings");
            return ratings;
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }

    async getOne(id: string) {
        try {
            const rating = await this.ratingRepo.getOne(id);
            if (!rating) throw this.response.notFound("rating is not found");
            return rating;
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }

    async getByTragetId(target: string) {
        try {
            const rating = await this.ratingRepo.getByTragetId(target);
            if (!rating) throw this.response.notFound("rating is not found");
            return rating;
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }

    async create(payload: CreateRating) {
        try {
            const new_rating = await this.ratingRepo.create(payload);
            if (!new_rating)
                throw this.response.badRequest("Error while creating new rating");
            return new_rating;
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }

    async update(id: string, payload: UpdateRating) {
        try {
            const exist_rating = await this.ratingRepo.getOne(id);
            if (!exist_rating) throw this.response.notFound("rating not found");

            const updated_rating = await this.ratingRepo.update(id, payload);
            if (!updated_rating)
                throw this.response.badRequest(
                    `Error while updating rating with id ${id}`,
                );
            return updated_rating;
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }

    async delete(id: string) {
        try {
            const exist_rating = await this.ratingRepo.getOne(id);
            if (!exist_rating) throw this.response.notFound("rating not found");

            return await this.ratingRepo.update(id, {
                ...exist_rating,
                status: false,
            });
        } catch (error) {
            this.errorHandler.handleServiceError(error);
        }
    }
}
