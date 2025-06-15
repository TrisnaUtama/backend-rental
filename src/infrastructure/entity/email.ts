import nodemailer, { type Transporter, type SentMessageInfo } from "nodemailer";
import { injectable, inject } from "inversify";
import { TYPES } from "./types";
import type { ILogger } from "./interfaces";
import type { BroadcastRepository } from "../repositories/boradcast.repo";
import type { NotificationRepository } from "../repositories/notification.repo";
import type { UserRepository } from "../repositories/user.repo";
import { loadTemplate } from "../utils/loadTemplates";
import type { Decimal } from "@prisma/client/runtime/library";
import type { PromoRepository } from "../repositories/promo.repo";
import { format } from "date-fns";

interface BookingDetailsForEmail {
	id: string;
	travel_package_name?: string;
	vehicle_name?: string;
	start_date: Date;
	end_date?: Date;
	total_price: Decimal;
	reason?: string;
	new_start_date?: Date;
	new_end_date?: Date;
	refund_amount?: Decimal;
	bank_name?: string;
	account_holder?: string;
	account_number?: string;
}

@injectable()
export class EmailService {
	private transporter: Transporter;
	private logger: ILogger;
	private broadcastRepo: BroadcastRepository;
	private notificationRepo: NotificationRepository;
	private userRepo: UserRepository;
	private promoRepo: PromoRepository;

	constructor(
		@inject(TYPES.logger) logger: ILogger,
		@inject(TYPES.broadcastRepo) broadcastRepo: BroadcastRepository,
		@inject(TYPES.notificationRepo) notificationRepo: NotificationRepository,
		@inject(TYPES.userRepo) userRepo: UserRepository,
		@inject(TYPES.promoRepo) promoRepo: PromoRepository,
	) {
		const user = process.env.SMTP_USER;
		const pass = process.env.SMTP_PASSWORD;
		if (!user || !pass) throw new Error("SMTP credentials missing");

		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: true,
			auth: { user, pass },
		});
		this.logger = logger;
		this.broadcastRepo = broadcastRepo;
		this.notificationRepo = notificationRepo;
		this.userRepo = userRepo;
		this.promoRepo = promoRepo;
	}

	async send_otp(code: string, receiver: string): Promise<string> {
		const html = await loadTemplate("otp", {
			CODE: code,
		});
		const mail = {
			from: `"Bintang Transport Service" <no-reply@bintangtransportservice.club>`,
			to: receiver,
			subject: "Your OTP Code",
			html: html,
		};

		try {
			const info: SentMessageInfo = await this.transporter.sendMail(mail);
			this.logger.info(`OTP sent to ${receiver}: ${info.messageId}`);
			return info.messageId;
		} catch (error) {
			this.logger.error(
				`Failed sending OTP to ${receiver}: ${(error as Error).message}`,
			);
			throw error;
		}
	}

	async send_broadcast(notification_id: string) {
		try {
			const notification = await this.notificationRepo.getOne(notification_id);
			if (!notification) {
				this.logger.error(
					`send_broadcast failed: Notification with ID ${notification_id} not found.`,
				);
				return;
			}
			const broadcasts =
				await this.broadcastRepo.getAllByNotifId(notification_id);
			if (broadcasts.length === 0) {
				this.logger.warn(
					`No broadcast recipients found for notification ID ${notification_id}.`,
				);
				return;
			}

			let htmlTemplateName = "broadcast";
			let replacements: Record<string, any> = {
				TITLE: notification.title,
				MESSAGE: notification.message,
				CTA_LINK: "https://bintangtransportservice.club",
			};

			if (notification.type === "PROMO" && notification.promo_id) {
				const promo = await this.promoRepo.getOne(notification.promo_id);
				if (promo) {
					htmlTemplateName = "promo-broadcast";
					replacements = {
						...replacements,
						PROMO_CODE: promo.code,
						DISCOUNT_VALUE: promo.discount_value,
						START_DATE: format(promo.start_date, "MMMM dd, yyyy"),
						END_DATE: format(promo.end_date, "MMMM dd, yyyy"),
						CTA_LINK: "https://bintangtransportservice.club/promos",
						BANNER_IMAGE_URL: "https://your-cdn.com/default-promo-banner.jpg",
					};
				}
			}

			for (const broadcast of broadcasts) {
				const user = await this.userRepo.getOne(broadcast.user_id);
				if (!user || !user.email) {
					this.logger.warn(
						`Skipping user ${broadcast.user_id}: not found or no email.`,
					);
					continue;
				}

				try {
					const html = await loadTemplate(htmlTemplateName, {
						...replacements,
						USER_NAME: user.name || "Customer",
					});

					const mailOptions = {
						from: `"Bintang Transport Service" <no-reply@bintangtransportservice.club>`,
						to: user.email,
						subject: notification.title,
						html: html,
					};

					const info = await this.transporter.sendMail(mailOptions);
					this.logger.info(
						`Broadcast email sent to ${user.email}: ${info.messageId}`,
					);
				} catch (error) {
					this.logger.error(
						`Failed to send broadcast to ${user.email}: ${
							(error as Error).message
						}`,
					);
				}
			}
			return { success: true, count: broadcasts.length };
		} catch (error) {
			this.logger.error(
				`Broadcast process failed for notification ${notification_id}: ${
					(error as Error).message
				}`,
			);
			throw error;
		}
	}

	private async _sendTemplatedEmail(
		recipientEmail: string,
		subject: string,
		templateName: string,
		data: Record<string, any>,
	): Promise<SentMessageInfo> {
		try {
			const html = await loadTemplate(templateName, data);
			const mailOptions = {
				from: `"Bintang Transport Service" <no-reply@bintangtransportservice.club>`,
				to: recipientEmail,
				subject: subject,
				html: html,
			};
			const info: SentMessageInfo =
				await this.transporter.sendMail(mailOptions);
			this.logger.info(
				`Templated email sent to ${recipientEmail}: ${info.messageId}`,
			);
			return info;
		} catch (error) {
			this.logger.error(
				`Failed sending templated email to ${recipientEmail} (Template: ${templateName}): ${
					(error as Error).message
				}`,
			);
			throw error;
		}
	}

	async sendBookingStatusNotification(
		userId: string,
		bookingDetails: BookingDetailsForEmail,
		status: "RECEIVED" | "REJECTED",
		reason?: string,
	): Promise<SentMessageInfo | undefined> {
		try {
			const user = await this.userRepo.getOne(userId);
			if (!user || !user.email) {
				this.logger.warn(
					`User with ID ${userId} not found or has no email for booking status notification.`,
				);
				return undefined;
			}

			const subject = `Booking Update: Your Booking ${status} - #${bookingDetails.id}`;
			const templateData = {
				USER_NAME: user.name || "Pelanggan",
				BOOKING_ID: bookingDetails.id,
				STATUS_TEXT: status === "RECEIVED" ? "Telah Disetujui!" : "Ditolak.",
				STATUS_COLOR: status === "RECEIVED" ? "#28a745" : "#dc3545",
				MAIN_MESSAGE:
					status === "RECEIVED"
						? `Selamat! Booking Anda untuk ${
								bookingDetails.travel_package_name ||
								bookingDetails.vehicle_name
							} (${bookingDetails.start_date.toLocaleDateString("id-ID")} - ${
								bookingDetails.end_date?.toLocaleDateString("id-ID") ||
								bookingDetails.start_date.toLocaleDateString("id-ID")
							}) telah berhasil disetujui.`
						: `Mohon maaf, booking Anda untuk ${
								bookingDetails.travel_package_name ||
								bookingDetails.vehicle_name
							} (${bookingDetails.start_date.toLocaleDateString("id-ID")} - ${
								bookingDetails.end_date?.toLocaleDateString("id-ID") ||
								bookingDetails.start_date.toLocaleDateString("id-ID")
							}) telah ditolak.`,
				REASON_SECTION: reason
					? `<p style="margin-bottom: 15px;"><strong>Alasan Penolakan:</strong> ${reason}</p>`
					: "",
				CALL_TO_ACTION_TEXT:
					status === "RECEIVED" ? "Lihat Detail Booking" : "Hubungi Dukungan",
				CTA_LINK:
					status === "RECEIVED"
						? `${process.env.FRONTEND_URL}/detail-booking-vehicle/${bookingDetails.id}`
						: `${process.env.FRONTEND_URL}/support`,
				ADDITIONAL_DETAILS: `
            <p style="margin-bottom: 5px;"><strong>Nama Paket/Kendaraan:</strong> ${
							bookingDetails.travel_package_name || bookingDetails.vehicle_name
						}</p>
            <p style="margin-bottom: 5px;"><strong>Tanggal Mulai:</strong> ${bookingDetails.start_date.toLocaleDateString(
							"id-ID",
							{
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							},
						)}</p>
            ${
							bookingDetails.end_date
								? `<p style="margin-bottom: 5px;"><strong>Tanggal Selesai:</strong> ${bookingDetails.end_date.toLocaleDateString(
										"id-ID",
										{
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
										},
									)}</p>`
								: ""
						}
            <p style="margin-bottom: 5px;"><strong>Total Harga:</strong> Rp${bookingDetails.total_price
							.toFixed(0)
							.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
          `,
			};

			return await this._sendTemplatedEmail(
				user.email,
				subject,
				"booking-status-email",
				templateData,
			);
		} catch (error) {
			this.logger.error(
				`Error sending booking status email for booking ${bookingDetails.id}: ${
					(error as Error).message
				}`,
			);
			return undefined;
		}
	}

	async sendRescheduleStatusNotification(
		userId: string,
		bookingDetails: BookingDetailsForEmail,
		status: "APPROVED" | "REJECTED",
		reason?: string,
	): Promise<SentMessageInfo | undefined> {
		try {
			const user = await this.userRepo.getOne(userId);
			if (!user || !user.email) {
				this.logger.warn(
					`User with ID ${userId} not found or has no email for reschedule status notification.`,
				);
				return undefined;
			}

			const subject = `Reschedule Update: Your Request for Booking #${bookingDetails.id} ${status}`;
			const templateData = {
				USER_NAME: user.name || "Pelanggan",
				BOOKING_ID: bookingDetails.id,
				STATUS_TEXT: status === "APPROVED" ? "Telah Disetujui!" : "Ditolak.",
				STATUS_COLOR: status === "APPROVED" ? "#28a745" : "#dc3545",
				MAIN_MESSAGE:
					status === "APPROVED"
						? `Permintaan *reschedule* Anda untuk booking #${
								bookingDetails.id
							} telah disetujui. Booking Anda yang baru adalah dari ${bookingDetails.new_start_date?.toLocaleDateString(
								"id-ID",
							)} hingga ${bookingDetails.new_end_date?.toLocaleDateString(
								"id-ID",
							)}.`
						: `Mohon maaf, permintaan *reschedule* Anda untuk booking #${bookingDetails.id} telah ditolak.`,
				REASON_SECTION: reason
					? `<p style="margin-bottom: 15px;"><strong>Alasan Penolakan:</strong> ${reason}</p>`
					: "",
				CALL_TO_ACTION_TEXT:
					status === "APPROVED" ? "Lihat Booking Baru" : "Hubungi Dukungan",
				CTA_LINK:
					status === "APPROVED"
						? `${process.env.FRONTEND_URL}/detail-booking-vehicle/${bookingDetails.id}`
						: `${process.env.FRONTEND_URL}/support`,
				ADDITIONAL_DETAILS: `
            <p style="margin-bottom: 5px;"><strong>Nama Paket/Kendaraan:</strong> ${
							bookingDetails.travel_package_name || bookingDetails.vehicle_name
						}</p>
            <p style="margin-bottom: 5px;"><strong>Tanggal Lama:</strong> ${bookingDetails.start_date.toLocaleDateString(
							"id-ID",
							{
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							},
						)} - ${
							bookingDetails.end_date?.toLocaleDateString("id-ID", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							}) || "Tidak Ada"
						}</p>
            <p style="margin-bottom: 5px;"><strong>Tanggal Baru:</strong> ${
							bookingDetails.new_start_date?.toLocaleDateString("id-ID", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							}) || "Tidak Ada"
						} - ${
							bookingDetails.new_end_date?.toLocaleDateString("id-ID", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							}) || "Tidak Ada"
						}</p>
          `,
			};

			return await this._sendTemplatedEmail(
				user.email,
				subject,
				"booking-status-email",
				templateData,
			);
		} catch (error) {
			this.logger.error(
				`Error sending reschedule status email for booking ${
					bookingDetails.id
				}: ${(error as Error).message}`,
			);
			return undefined;
		}
	}

	async sendRefundStatusNotification(
		userId: string,
		bookingDetails: BookingDetailsForEmail,
		status: "APPROVED" | "REJECTED",
		reason?: string,
	): Promise<SentMessageInfo | undefined> {
		try {
			const user = await this.userRepo.getOne(userId);
			if (!user || !user.email) {
				this.logger.warn(
					`User with ID ${userId} not found or has no email for refund status notification.`,
				);
				return undefined;
			}

			const subject = `Refund Update: Your Request for Booking #${bookingDetails.id} ${status}`;
			const templateData = {
				USER_NAME: user.name || "Pelanggan",
				BOOKING_ID: bookingDetails.id,
				STATUS_TEXT: status === "APPROVED" ? "Telah Disetujui!" : "Ditolak.",
				STATUS_COLOR: status === "APPROVED" ? "#28a745" : "#dc3545",
				MAIN_MESSAGE:
					status === "APPROVED"
						? `Permintaan *refund* Anda untuk booking #${
								bookingDetails.id
							} telah disetujui. Dana sebesar Rp${bookingDetails.refund_amount
								?.toFixed(0)
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									".",
								)} akan ditransfer ke rekening Anda.`
						: `Mohon maaf, permintaan *refund* Anda untuk booking #${bookingDetails.id} telah ditolak.`,
				REASON_SECTION: reason
					? `<p style="margin-bottom: 15px;"><strong>Alasan Penolakan:</strong> ${reason}</p>`
					: "",
				CALL_TO_ACTION_TEXT:
					status === "APPROVED" ? "Lihat Detail Booking" : "Hubungi Dukungan",
				CTA_LINK:
					status === "APPROVED"
						? `${process.env.FRONTEND_URL}/detail-booking-vehicle/${bookingDetails.id}`
						: `${process.env.FRONTEND_URL}/support`,
				ADDITIONAL_DETAILS: `
            <p style="margin-bottom: 5px;"><strong>Nama Paket/Kendaraan:</strong> ${
							bookingDetails.travel_package_name || bookingDetails.vehicle_name
						}</p>
            <p style="margin-bottom: 5px;"><strong>Total Pembayaran:</strong> Rp${bookingDetails.total_price
							.toFixed(0)
							.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
            ${
							status === "APPROVED" && bookingDetails.refund_amount
								? `
              <p style="margin-bottom: 5px;"><strong>Jumlah Refund Disetujui:</strong> Rp${bookingDetails.refund_amount
								.toFixed(0)
								.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
              <p style="margin-bottom: 5px;"><strong>Bank Penerima:</strong> ${
								bookingDetails.bank_name
							}</p>
              <p style="margin-bottom: 5px;"><strong>Nomor Rekening:</strong> ${
								bookingDetails.account_number
							}</p>
              <p style="margin-bottom: 5px;"><strong>Nama Pemilik Rekening:</strong> ${
								bookingDetails.account_holder
							}</p>
            `
								: ""
						}
          `,
			};

			return await this._sendTemplatedEmail(
				user.email,
				subject,
				"booking-status-email",
				templateData,
			);
		} catch (error) {
			this.logger.error(
				`Error sending refund status email for booking ${bookingDetails.id}: ${
					(error as Error).message
				}`,
			);
			return undefined;
		}
	}
}
