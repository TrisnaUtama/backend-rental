import "reflect-metadata";
import { injectable, inject } from "inversify";
import { type PrismaClient,  Roles, type Users } from "@prisma/client";
import { TYPES, type CreateUser, type UpdateUser } from "../entity/types";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { IUser } from "../entity/interfaces";

@injectable()
export class UserRepository implements IUser {
  private readonly prisma: PrismaClient;
  private readonly errorHandler: ErrorHandler;

  constructor(
    @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.prisma) prisma: PrismaClient
  ) {
    this.prisma = prisma;
    this.errorHandler = errorHandler;
  }

  /**
   * Get all users except SUPERADMIN.
   */
  async getAll(): Promise<Users[]> {
    try {
      return await this.prisma.users.findMany({
        where: {
          role: { not: Roles.SUPERADMIN },
        },
      });
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
      throw error;
    }
  }

  /**
   * Get a single user by ID or Email.
   */
  async getOne(idOrEmail: string): Promise<Users | null> {
    try {
      return await this.prisma.users.findFirst({
        where: {
          OR: [{ id: idOrEmail }, { email: idOrEmail }],
        },
      });
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
      throw error;
    }
  }

  /**
   * Find user by refresh token.
   */
  async getRefreshToken(token: string): Promise<Users | null> {
    try {
      return await this.prisma.users.findFirst({
        where: { refresh_token: token },
      });
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
      throw error;
    }
  }

  /**
   * Create new user.
   */
  async create(payload: CreateUser): Promise<Users> {
    try {
      return await this.prisma.users.create({ data: payload });
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
      throw error;
    }
  }

  /**
   * Update existing user.
   */
  async update(id: string, payload: UpdateUser): Promise<Users> {
    try {
      return await this.prisma.users.update({
        where: { id },
        data: payload,
      });
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
      throw error;
    }
  }
}
