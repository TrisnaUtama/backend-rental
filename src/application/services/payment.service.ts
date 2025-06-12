import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { PaymentRepository } from "./../../infrastructure/repositories/payment.repo";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import {
	TYPES,
	type UpdatePayment,
} from "../../infrastructure/entity/types";
import type { Http } from "../../infrastructure/utils/response/http.response";

@injectable()
export class PaymentService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private paymentRepo: PaymentRepository;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.paymentRepo) bookingRepo: PaymentRepository,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.paymentRepo = bookingRepo;
	}

	async getAll() {
		try {
			const payments = await this.paymentRepo.getAll();
			if (!payments)
				throw this.response.badRequest("Error while retreiving payments data");
			return payments;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const payment = await this.paymentRepo.getOne(id);
			if (!payment)
				throw this.response.badRequest(
					`Error while retreiving payment with id ${id}`,
				);
			return payment;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getByOrderid(order_id: string) {
		try {
			const payment = await this.paymentRepo.getByOrderId(order_id);
			if (!payment)
				throw this.response.badRequest(
					`Error while retreiving payment with id ${order_id}`,
				);
			return payment;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: any) {
		try {
			const created_payment = await this.paymentRepo.create(payload);
			if (!created_payment)
				throw this.response.badRequest("Error while creating payment");
			return created_payment;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdatePayment) {
		try {
			const exist_payment = await this.paymentRepo.getOne(id);
			if (!exist_payment)
				throw this.response.notFound(`Payment id ${id} not found`);
			const update_payment = await this.paymentRepo.update(
				exist_payment.id,
				payload,
			);
			if (!update_payment)
				throw this.response.badRequest(
					`Error while updating payment with id ${exist_payment.id}`,
				);
			return update_payment;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
