import "reflect-metadata";
import { inject, injectable } from "inversify";
import type {
	PrismaClient,
	Refunds,
	Booking_Status,
	Prisma,
} from "@prisma/client";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import {
	TYPES,
	type CreateRefund,
	type UpdateRefund,
} from "../../infrastructure/entity/types";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { BookingRepository } from "../../infrastructure/repositories/booking.repo";
import type { RefundRepository } from "./../../infrastructure/repositories/refund.repo";

@injectable()
export class RefundService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private refundRepo: RefundRepository;
	private bookingRepo: BookingRepository;
	private prisma: PrismaClient;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.refundRepo) refundRepo: RefundRepository,
		@inject(TYPES.bookingRepo) bookingRepo: BookingRepository,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.refundRepo = refundRepo;
		this.bookingRepo = bookingRepo;
		this.prisma = prisma;
	}

	// ... getAll, getOne, and create methods ...
	async getAll() {
		try {
			const refunds = await this.refundRepo.getAll();
			if (!refunds)
				throw this.response.badRequest("Error while getting refunds");
			return refunds;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const refund = await this.refundRepo.getOne(id);
			if (!refund) throw this.response.notFound("refund is not found");
			return refund;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateRefund) {
		try {
			const new_refund = await this.refundRepo.create(payload);
			if (!new_refund)
				throw this.response.badRequest("Error while creating new refund");
			return new_refund;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(
		id: string,
		payload: UpdateRefund,
		action: "approve" | "reject",
	): Promise<Refunds | undefined> {
		try {
			const updatedRefund = await this.prisma.$transaction(async (trx) => {
				const exists_refund = await this.refundRepo.getOne(id, trx);
				if (!exists_refund) {
					throw this.response.notFound("Refund request not found.");
				}
				if (exists_refund.status !== "PENDING") {
					throw this.response.badRequest(
						`This refund has already been processed with status: ${exists_refund.status}`,
					);
				}
				const isRejection = action === "reject";
				let refundUpdateData: Prisma.RefundsUpdateInput;
				let bookingStatusUpdate: { status: Booking_Status };

				if (isRejection) {
					refundUpdateData = {
						status: "REJECTED",
						admin_notes: payload.admin_notes || "Rejected by admin.",
						approval_date: new Date(),
					};
					bookingStatusUpdate = { status: "REJECTED_REFUND" as Booking_Status };
				} else {
					if (!payload.transfer_proof) {
						throw this.response.badRequest(
							"Transfer proof is required for an approval.",
						);
					}
					refundUpdateData = {
						status: "APPROVED",
						admin_notes: payload.admin_notes,
						transfer_proof: payload.transfer_proof,
						approval_date: new Date(),
					};
					bookingStatusUpdate = { status: "REFUNDED" as Booking_Status };
				}
				await this.bookingRepo.update(
					exists_refund.booking_id,
					bookingStatusUpdate,
					trx,
				);
				const final_refund = await this.refundRepo.update(
					id,
					refundUpdateData,
					trx,
				);
				if (!final_refund) {
					throw this.response.badRequest(
						`Error while updating refund with id ${id}`,
					);
				}
				return final_refund;
			});
			return updatedRefund;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
