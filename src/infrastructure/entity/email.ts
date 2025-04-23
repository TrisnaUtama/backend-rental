import nodemailer, { type Transporter, type SentMessageInfo } from "nodemailer";
import { injectable, inject } from "inversify";
import { TYPES } from "./types";
import type { ILogger } from "./interfaces";

@injectable()
export class EmailService {
	private transporter: Transporter;

	constructor(@inject(TYPES.logger) private logger: ILogger) {
		const user = process.env.SMTP_USER;
		const pass = process.env.SMTP_PASSWORD;
		if (!user || !pass) throw new Error("SMTP credentials missing");

		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: true,
			auth: { user, pass },
		});
	}

	async notify(code: number, receiver: string): Promise<string> {
		const mail = {
			from: `"Bintang Transport Service" <no-reply@bintangtransportservice.club>`,
			to: receiver,
			subject: "Your OTP Code",
			text: `Your OTP code is ${code} and will expire in 5 minutes.`,
		};

		try {
			const info: SentMessageInfo = await this.transporter.sendMail(mail);
			this.logger.info(`OTP sent to ${receiver}: ${info.messageId}`);
			return info.messageId;
		} catch (err) {
			this.logger.error(
				`Failed sending OTP to ${receiver}: ${(err as Error).message}`,
			);
			throw err;
		}
	}
}
