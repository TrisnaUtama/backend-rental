import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { OtpRepository } from './../../infrastructure/repositories/otp.repo';
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";
import { TYPES } from "../../infrastructure/entity/types";


@injectable()
export class OtpService {
    private otpRepo: OtpRepository
    private errorHandler: ErrorHandler;
	private response: Http;

    constructor(
            @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
            @inject(TYPES.http) response: Http,
            @inject(TYPES.otpRepo) otpRepo: OtpRepository,
        ) {
            this.errorHandler = errorHandler;
            this.response = response;
            this.otpRepo = otpRepo
        }

    async getOne(id:string){
        try{
            const otp = await this.otpRepo.getOne(id);
			if (!otp)
				throw this.response.badRequest("Error while retreived otp");
			return otp;
        }catch (error) {
			this.errorHandler.handleServiceError(error);
		}
    }
}
