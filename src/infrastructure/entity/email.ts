import nodemailer, { type Transporter, type SentMessageInfo } from "nodemailer";
import { injectable, inject } from "inversify";
import { TYPES } from "./types";
import type { ILogger } from "./interfaces";
import type { BroadcastRepository } from "../repositories/boradcast.repo";
import type { NotificationRepository } from "../repositories/notification.repo";
import type { UserRepository } from "../repositories/user.repo";
import { loadTemplate } from "../utils/loadTemplates";

@injectable()
export class EmailService {
	private transporter: Transporter;
	private logger: ILogger;
	private broadcastRepo: BroadcastRepository;
	private notificationRepo: NotificationRepository;
	private userRepo: UserRepository;

	constructor(
		@inject(TYPES.logger) logger: ILogger,
		@inject(TYPES.broadcastRepo) broadcastRepo: BroadcastRepository,
		@inject(TYPES.notificationRepo) notificationRepo: NotificationRepository,
		@inject(TYPES.userRepo) userRepo: UserRepository,
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
		const notification = await this.notificationRepo.getOne(notification_id);
		if (!notification) {
			throw new Error("Cannot get notification !");
		}

		const notifToSend =
			await this.broadcastRepo.getAllByNotifId(notification_id);

		const replacement = {
			TITLE: notification.title,
			MESSAGE: notification.message,
			BANNER_IMAGE_URL:
				"https://png.pngtree.com/png-vector/20210131/ourmid/pngtree-promo-lettering-with-yellow-color-and-purple-shadow-png-image_2871341.jpg",
			START_DATE: "October 15, 2023",
			END_DATE: "November 15, 2023",
			PROMO_CODE: "BINTANG30",
			CTA_LINK: "https://bintangtransportservice.club/promo",
		};

		try {
			for (const notif of notifToSend) {
				const html = await loadTemplate("broadcast", replacement);
				const user = await this.userRepo.getOne(notif.user_id)

				const mailOptions = {
					from: `"Bintang Transport Service" <no-reply@bintangtransportservice.club>`,
					to: user?.email,
					subject: notification.title,
					text: `${notification.title}\n\n${notification.message}\n\nUnsubscribe: https://bintangtransportservice.club/unsubscribe?user=${notif.user_id}`,
					html: html,
				};

				try {
					const info = await this.transporter.sendMail(mailOptions);
					this.logger.info(`Email sent to ${notif.user_id}: ${info.messageId}`);
				} catch (error) {
					this.logger.error(
						`Failed to send to ${notif.user_id}: ${(error as Error).message}`,
					);
				}
			}
			return { success: true, count: notifToSend.length };
		} catch (error) {
			this.logger.error(`Broadcast failed: ${(error as Error).message}`);
			throw error;
		}
	}
}
