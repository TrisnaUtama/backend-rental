import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { EmailService } from "../../infrastructure/entity/email";
import type { UserRepository } from "../../infrastructure/repositories/user.repo";
import type { OtpRepository } from "../../infrastructure/repositories/otp.repo";
import {
  type CreateUser,
  TYPES,
  type UpdateUser,
} from "../../infrastructure/entity/types";
import { type OTPs, Roles } from "@prisma/client";
import type { HashService } from "../../infrastructure/utils/hashed_password";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import { UserDTO } from "../dtos/userDTO";
import { signJwt, verifyJwt } from "../../infrastructure/utils/jwt";
import {
  ACCESS_TOKEN_EXP,
  REFRESH_TOKEN_EXP,
} from "../../infrastructure/utils/constant";
import type { Http } from "../../infrastructure/utils/response/http.response";
import { authService } from "../instances";

@injectable()
export class AuthService {
  private userRepo: UserRepository;
  private otpRepo: OtpRepository;
  private hashed: HashService;
  private errorHandler: ErrorHandler;
  private emailService: EmailService;
  private response: Http;

  constructor(
    @inject(TYPES.userRepo) userRepo: UserRepository,
    @inject(TYPES.otpRepo) otpRepo: OtpRepository,
    @inject(TYPES.hashed_password) hashed: HashService,
    @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.email) emailService: EmailService,
    @inject(TYPES.http) response: Http
  ) {
    this.userRepo = userRepo;
    this.otpRepo = otpRepo;
    this.hashed = hashed;
    this.errorHandler = errorHandler;
    this.emailService = emailService;
    this.response = response;
  }

  async signUp(payload: CreateUser) {
    try {
      const existing_user = await this.userRepo.getOne(payload.email);
      if (existing_user)
        throw this.response.badRequest("email already exist !");

      const hashed_password = await this.hashed.hash(payload.password);
      const new_payload = {
        ...payload,
        password: hashed_password,
        is_verified: false,
        role: Roles.CUSTOMER,
      };

      const new_account = await this.userRepo.create(new_payload);

      if (!new_account)
        throw this.response.badRequest("account cannot created");

      this.sendOtp(new_account.id, new_account.email);
      return new UserDTO(new_account).fromEntity();
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async signIn(email: string, password: string) {
    try {
      const get_payload = await this.userRepo.getOne(email);

      if (!get_payload) throw this.response.badRequest("Invalid Credentials !");

      const compare_password = await Bun.password.verify(
        password,
        get_payload.password,
        "bcrypt"
      );

      if (!compare_password)
        throw this.response.badRequest("Invalid Credentials !");

      if (!get_payload.is_verified)
        throw this.response.badRequest("Your account not verified !");

      const payload = {
        user_id: get_payload.id,
        role: get_payload.role,
        email: get_payload.email,
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

      if (!payload) throw this.response.badRequest("otp code not found");

      if (code !== payload.otp_code)
        throw this.response.badRequest("Invalid OTP Code");

      if (payload.expiry_time.getTime() < time_comparation)
        throw this.response.badRequest("Expired OTP Code");

      const verified_account: UpdateUser = {
        is_verified: true,
      };
      await this.userRepo.update(userId, verified_account);

      return true;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
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

      await this.emailService.send_otp(randomCode.toString(), emailRecepient);
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async refresh(token: string) {
    try {
      const payload = verifyJwt(token);
      if (!payload)
        throw this.response.badRequest("Invalid or expired refresh token");
      const user = await this.userRepo.getRefreshToken(token);
      if (!user) throw this.response.badRequest("Refresh token not recognized");
      const newPayload = {
        user_id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      };
      const access_token = signJwt(newPayload, ACCESS_TOKEN_EXP);
      return { user, access_token };
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }
}
