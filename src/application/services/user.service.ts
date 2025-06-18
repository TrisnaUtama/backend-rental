import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { UserRepository } from "../../infrastructure/repositories/user.repo";
import {
	type CreateUser,
	TYPES,
	type UpdateUser,
} from "../../infrastructure/entity/types";
import type { HashService } from "../../infrastructure/utils/hashed_password";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";
import { UserDTO } from "../dtos/userDTO";
import csv from "csv-parser";
import * as xlsx from "xlsx";
import { Readable } from "node:stream";

@injectable()
export class UserService {
	private userRepo: UserRepository;
	private hashed: HashService;
	private error: ErrorHandler;
	private response: Http;

	constructor(
		@inject(TYPES.userRepo) userRepo: UserRepository,
		@inject(TYPES.hashed_password) hashed: HashService,
		@inject(TYPES.errorHandler) error: ErrorHandler,
		@inject(TYPES.http) response: Http,
	) {
		this.userRepo = userRepo;
		this.hashed = hashed;
		this.error = error;
		this.response = response;
	}

	async getAll() {
		try {
			const users = await this.userRepo.getAll();
			if (!users)
				throw this.response.badRequest("Error while retreived users !");
			return users;
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const user = await this.userRepo.getOne(id);
			if (!user)
				throw this.response.badRequest("Error while retreived users !");

			return user;
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async create(payload: CreateUser) {
		try {
			const existing_user = await this.userRepo.getOne(payload.email);
			if (existing_user)
				throw this.response.badRequest("email already exist !");

			const hashed_password = await this.hashed.hash(
				`${payload.password}${payload.email}`,
			);
			const new_payload = {
				...payload,
				password: hashed_password,
				is_verified: true,
			};

			const create_staff = await this.userRepo.create(new_payload);
			if (!create_staff)
				throw this.response.badRequest("account cannot created");

			return new UserDTO(create_staff).fromEntity();
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateUser) {
		try {
			const get_user = await this.userRepo.getOne(id);
			if (!get_user) throw this.response.notFound("User not found !");
			let hashed_password: string | undefined = undefined;
			if (payload.password) {
				const isHashed = payload.password.startsWith("$2b$");
				hashed_password = isHashed
					? payload.password
					: await this.hashed.hash(`${payload.password}${get_user.email}`);
			}
			console.log(get_user.email);
			console.log(payload.password);
			const new_payload: UpdateUser = {
				...payload,
				...(hashed_password && { password: hashed_password }),
			};
			const updated_user = await this.userRepo.update(id, new_payload);
			return updated_user;
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async delete(id: string) {
		try {
			const deleted_user = await this.userRepo.update(id, { status: false });
			if (!deleted_user)
				throw this.response.badRequest(
					"Error while trying to delete user account !",
				);
			return deleted_user;
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async createFromUpload(fileBuffer: Buffer, originalname: string) {
		const fileExtension = originalname.split(".").pop()?.toLowerCase();
		let usersData: CreateUser[];
		if (fileExtension === "csv") {
			usersData = await this.parseCsv(fileBuffer);
		} else if (fileExtension === "xlsx" || fileExtension === "xls") {
			usersData = this.parseExcel(fileBuffer);
		} else {
			throw this.response.badRequest(
				"Unsupported file type. Please upload a CSV or Excel file.",
			);
		}

		const creationResults = [];
		for (const userData of usersData) {
			try {
				if (!userData.email || !userData.name) {
					continue;
				}
				const existingUser = await this.userRepo.getOne(userData.email);
				if (existingUser) {
					continue;
				}
				const payloadWithCorrectTypes = {
					...userData,
					phone_number: String(userData.phone_number),
				};
				const newUser = await this.create(payloadWithCorrectTypes);
				creationResults.push({
					status: "success",
					email: userData.email,
					data: newUser,
				});
			} catch (error: any) {
				creationResults.push({
					status: "error",
					email: userData.email,
					reason: error.message,
				});
			}
		}
		return creationResults;
	}

	private async parseCsv(buffer: Buffer): Promise<CreateUser[]> {
		return new Promise((resolve, reject) => {
			const results: CreateUser[] = [];
			const stream = Readable.from(buffer);
			stream
				.pipe(csv())
				.on("data", (data: any) => results.push(data))
				.on("end", () => resolve(results))
				.on("error", (error: any) => reject(error));
		});
	}

	private parseExcel(buffer: Buffer): CreateUser[] {
		const workbook = xlsx.read(buffer, { type: "buffer" });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		return xlsx.utils.sheet_to_json<CreateUser>(worksheet);
	}
}
