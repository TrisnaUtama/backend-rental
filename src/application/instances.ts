import { Container } from "inversify";
import { prisma } from "../infrastructure/utils/prisma";
import { TYPES } from "../infrastructure/entity/types";
import { Logger } from "../infrastructure/entity/logger";
import { UserRepository } from "../infrastructure/repositories/user.repo";
import { AuthService } from "./services/auth.services";
import type { ILogger, IOTP, IUser } from "../infrastructure/entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "../infrastructure/entity/error";
import { HashService } from "../infrastructure/utils/hashed_password";
import { OtpRepository } from "../infrastructure/repositories/otp.repo";
import { EmailService } from "../infrastructure/entity/email";

export const container = new Container();

// injector
container.bind<ILogger>(TYPES.logger).to(Logger);
container.bind<PrismaClient>(TYPES.prisma).toConstantValue(prisma);
container.bind<IUser>(TYPES.userRepo).to(UserRepository);
container.bind<IOTP>(TYPES.otpRepo).to(OtpRepository);
container.bind<ErrorHandler>(TYPES.error_handler).to(ErrorHandler);
container.bind<HashService>(TYPES.hashed_password).to(HashService);
container.bind<EmailService>(TYPES.email).to(EmailService);

// services
container.bind<AuthService>(AuthService).toSelf();

//instance
export const authService = container.get<AuthService>(AuthService);
