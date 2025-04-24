import { Container } from "inversify";
import { prisma } from "../infrastructure/utils/prisma";
import { TYPES } from "../infrastructure/entity/types";
import { Logger } from "../infrastructure/entity/logger";
import { UserRepository } from "../infrastructure/repositories/user.repo";
import { AuthService } from "./services/auth.services";
import type {
	ILogger,
	INotification,
	IOTP,
	IUser,
} from "../infrastructure/entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "../infrastructure/entity/errors/global.error";
import { HashService } from "../infrastructure/utils/hashed_password";
import { OtpRepository } from "../infrastructure/repositories/otp.repo";
import { EmailService } from "../infrastructure/entity/email";
import { UserService } from "./services/user.services";
import { NotificationService } from "./services/notification.services";
import { NotificationRepository } from "../infrastructure/repositories/notification.repo";

export const container = new Container();

// injector
container.bind<ILogger>(TYPES.logger).to(Logger);
container.bind<PrismaClient>(TYPES.prisma).toConstantValue(prisma);
container.bind<IUser>(TYPES.userRepo).to(UserRepository);
container.bind<IOTP>(TYPES.otpRepo).to(OtpRepository);
container
	.bind<INotification>(TYPES.notificationRepo)
	.to(NotificationRepository);
container.bind<ErrorHandler>(TYPES.error_handler).to(ErrorHandler);
container.bind<HashService>(TYPES.hashed_password).to(HashService);
container.bind<EmailService>(TYPES.email).to(EmailService);

// services
container.bind<AuthService>(AuthService).toSelf();
container.bind<UserService>(UserService).toSelf();
container.bind<NotificationService>(NotificationService).toSelf();

//instance
export const authService = container.get<AuthService>(AuthService);
export const userService = container.get<UserService>(UserService);
export const notificationService =
	container.get<NotificationService>(NotificationService);
