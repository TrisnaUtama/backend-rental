import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { IStorage } from "./../entity/interfaces";
import { TYPES } from "../entity/types";
import { promises as fs } from "node:fs";
import path from "node:path";

const STORAGE_DIR = process.env.STORAGE_PATH || "./uploads";

@injectable()
export class StorageRepository implements IStorage {
	private errorHandler: ErrorHandler;

	constructor(@inject(TYPES.errorHandler) errorHandler: ErrorHandler) {
		this.errorHandler = errorHandler;
	}

	async saveImages(file: File) {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const ext = file.name.split(".").pop();
			const filename = `${Date.now()}-${Math.random()
				.toString(36)
				.substring(2)}.${ext}`;
			const filePath = path.join(STORAGE_DIR, filename);

			await fs.mkdir(STORAGE_DIR, { recursive: true });
			await fs.writeFile(filePath, buffer);

			return filename;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async deleteImage(filename: string) {
		try {
			if (!filename || filename.includes("..") || filename.includes("/")) {
				throw new Error("Invalid filename");
			}
			const filePath = path.join(STORAGE_DIR, filename);
			await fs.unlink(filePath);
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getImage(filename: string) {
		try {
			if (!filename || filename.includes("..") || filename.includes("/")) {
				throw new Error("Invalid filename");
			}
			const filePath = path.join(STORAGE_DIR, filename);
			await fs.access(filePath);
			return filePath;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
