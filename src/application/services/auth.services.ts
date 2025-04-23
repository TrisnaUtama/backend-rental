import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { EmailService } from "./../../infrastructure/entity/email";
import type { UserRepository } from "../../infrastructure/repositories/user.repo";
import type { OtpRepository } from "../../infrastructure/repositories/otp.repo";
import {
	type CreateUser,
	TYPES,
	type UpdateUser,
} from "../../infrastructure/entity/types";
import { type OTPs, Roles } from "@prisma/client";
import type { ILogger } from "../../infrastructure/entity/interfaces";
import type { HashService } from "../../infrastructure/utils/hashed_password";
import type { ErrorHandler } from "../../infrastructure/entity/error";
import { UserDTO } from "../dtos/userDTO";
import { signJwt } from "../../infrastructure/utils/jwt";
import {
	ACCESS_TOKEN_EXP,
	REFRESH_TOKEN_EXP,
} from "../../infrastructure/utils/constant";

@injectable()
export class AuthService {
	private userRepo: UserRepository;
	private otpRepo: OtpRepository;
	private hashed: HashService;
	private logger: ILogger;
	private errorHandler: ErrorHandler;
	private emailService: EmailService;

	constructor(
		@inject(TYPES.userRepo) userRepo: UserRepository,
		@inject(TYPES.otpRepo) otpRepo: OtpRepository,
		@inject(TYPES.logger) logger: ILogger,
		@inject(TYPES.hashed_password) hashed: HashService,
		@inject(TYPES.error_handler) errorHandler: ErrorHandler,
		@inject(TYPES.email) emailService: EmailService,
	) {
		this.userRepo = userRepo;
		this.otpRepo = otpRepo;
		this.logger = logger;
		this.hashed = hashed;
		this.errorHandler = errorHandler;
		this.emailService = emailService;
	}

	async signUp(payload: CreateUser) {
		try {
			const existing_user = await this.userRepo.getOne(payload.email);
			if (existing_user) {
				this.logger.warn("email already exsist !");
				throw new Error("email already exsist !");
			}

			const hashed_password = await this.hashed.hash(payload.password);
			const new_payload = {
				...payload,
				password: hashed_password,
				is_verified: false,
				role: Roles.CUSTOMER,
			};

			const new_account = await this.userRepo.create(new_payload);

			if (!new_account) {
				throw new Error("account cannot created");
			}

			this.sendOtp(new_account.id, new_account.email);
			return new UserDTO(new_account).fromEntity();
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async signIn(email: string, password: string) {
		try {
			const get_payload = await this.userRepo.getOne(email);

			if (!get_payload) {
				this.logger.error("Invalid Credentials !");
				throw new Error("Invalid Credentials !");
			}

			const compare_password = await Bun.password.verify(
				password,
				get_payload.password,
				"bcrypt",
			);

			if (!compare_password) {
				this.logger.error("Invalid Credentials !");
				throw new Error("Invalid Credentials !");
			}

			if (!get_payload.is_verified) {
				this.logger.info("Your account not verified !");
				throw new Error("Your account not verified !");
			}

			const payload = {
				user_id: get_payload.id,
				role: get_payload.role,
			};

			const access_token = signJwt(payload, ACCESS_TOKEN_EXP);
			const refresh_token = signJwt(payload, REFRESH_TOKEN_EXP);

			const login_customer = await this.userRepo.update(payload.user_id, {
				refresh_token: refresh_token,
			});

			return {
				access_token,
				refresh_token,
				user: new UserDTO(login_customer).fromEntity(),
			};
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async verification(code: string, userId: string) {
		try {
			const payload = await this.otpRepo.getOne(userId);
			const time_comparation = Date.now();

			if (!payload) {
				throw new Error("otp code not found");
			}

			if (code !== payload.otp_code) {
				throw new Error("Invalid OTP Code");
			}

			if (payload.expiry_time.getTime() < time_comparation) {
				throw new Error("Expired OTP Code");
			}

			const verified_account: UpdateUser = {
				is_verified: true,
			};
			await this.userRepo.update(userId, verified_account);

			return true;
		} catch (error) {
			return this.errorHandler.handleServiceError(error);
		}
	}

	// sending otp code
	async sendOtp(userId: string, emailRecepient: string) {
		try {
			const randomCode = Math.floor(100000 + Math.random() * 900000);
			const expiryTimeUTC = new Date(Date.now() + 5 * 60 * 1000);

			const otp = await this.otpRepo.getOne(userId);

			const otpData: Omit<OTPs, "id" | "created_at"> = {
				user_id: userId,
				otp_code: randomCode.toString(),
				expiry_time: expiryTimeUTC,
			};

			if (!otp) await this.otpRepo.create(otpData);
			if (otp) await this.otpRepo.update(otp.id, otpData);

			await this.emailService.notify(randomCode, emailRecepient);
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
