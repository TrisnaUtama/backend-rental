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
			return await this.userRepo.getAll();
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.userRepo.getOne(id);
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async create(payload: CreateUser) {
		try {
			const existing_user = await this.userRepo.getOne(payload.email);
			if (existing_user) {
				throw this.response.badRequest("email already exist !");
			}

			const hashed_password = await this.hashed.hash(payload.password);
			const new_payload = {
				...payload,
				password: hashed_password,
				is_verified: true,
			};

			const create_staff = await this.userRepo.create(new_payload);
			if (!create_staff) {
				throw this.response.badRequest("account cannot created");
			}

			return new UserDTO(create_staff).fromEntity();
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateUser) {
		try {
			const get_user = await this.userRepo.getOne(id);
			if (!get_user) {
				throw this.response.notFound("User not found !");
			}

			const hashed_password = await this.hashed.hash(
				payload.password as string,
			);

			const new_payload: UpdateUser = {
				...payload,
				password: hashed_password,
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
			if (!deleted_user) {
				throw this.response.badRequest(
					"Error while trying to delete user account !",
				);
			}
			return deleted_user;
		} catch (error) {
			this.error.handleServiceError(error);
		}
	}
}
