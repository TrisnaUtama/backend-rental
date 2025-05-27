import { injectable, inject } from "inversify";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { StorageRepository } from "../../infrastructure/repositories/storage.repo";
import { TYPES } from "../../infrastructure/entity/types";

@injectable()
export class StorageService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private storageRepo: StorageRepository;

	constructor(
		@inject(TYPES.http) response: Http,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.storageRepo) storageRepo: StorageRepository,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.storageRepo = storageRepo;
	}

	async uploadImage(file: File) {
		try {
			if (!file) {
				return this.response.badRequest("No file provided");
			}
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
			];
			if (!allowedTypes.includes(file.type)) {
				return this.response.badRequest(
					"Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
				);
			}
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				return this.response.badRequest(
					"File size too large. Maximum 5MB allowed",
				);
			}
			const filename = await this.storageRepo.saveImages(file);
			if (!filename) {
				return this.response.badRequest("Failed to save image");
			}
			const payload = {
				filename,
				url: `https://storage.trisnautama.site/${filename}`,
			};
			return payload;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async updateImage(file: File, oldFilename: string) {
		try {
			if (!file) {
				return this.response.badRequest("No file provided");
			}
			if (!oldFilename) {
				return this.response.badRequest("No old filename provided");
			}
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
			];
			if (!allowedTypes.includes(file.type)) {
				return this.response.badRequest(
					"Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
				);
			}
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				return this.response.badRequest(
					"File size too large. Maximum 5MB allowed",
				);
			}
			try {
				await this.storageRepo.deleteImage(oldFilename);
			} catch (error: any) {
				return this.response.badRequest(
					`Failed to delete old image: ${error}`,
				);
			}
			const filename = await this.storageRepo.saveImages(file);

			if (!filename) {
				return this.response.badRequest("Failed to save new image");
			}

			const payload = {
				filename,
				url: `https://storage.trisnautama.site/${filename}`,
			};
			return payload;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getImagePath(filename: string) {
		try {
			if (!filename) {
				return this.response.badRequest("No filename provided");
			}
			const filePath = await this.storageRepo.getImage(filename);
			if (!filePath) {
				return this.response.notFound("Image not found");
			}
			return filePath;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async deleteImage(filename: string) {
		try {
			if (!filename) {
				return this.response.badRequest("No filename provided");
			}
			return await this.storageRepo.deleteImage(filename);
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
