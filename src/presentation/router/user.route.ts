import { Roles } from "@prisma/client";
import jwt from "@elysiajs/jwt";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import type { UpdateUser } from "../../infrastructure/entity/types";
import { Elysia, t } from "elysia";
import { userService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { response } from "../../application/instances";

export const userRoute = new Elysia({
	prefix: "/v1/users",
	detail: {
		tags: ["USER"],
	},
})
	.use(
		jwt({
			name: `${process.env.JWT_NAME}`,
			secret: `${process.env.JWT_SECRET_KEY}`,
		}),
	)
	.derive(async ({ cookie: { access_token }, set }) => {
		if (!access_token.value) {
			set.status = 401;
			throw response.unauthorized();
		}
		const jwtPayload: IJwtPayload = verifyJwt(access_token.value.toString());
		if (!jwtPayload) {
			set.status = 403;
			throw response.forbidden();
		}
		const userId = jwtPayload.user_id;
		if (!userId) throw response.badRequest("Invalid Payload !");
		const user = await userService.getOne(userId.toString());
		return {
			user,
		};
	})
	.get("/", async ({ set }) => {
		try {
			const users = await userService.getAll();
			if (!users) {
				throw response.badRequest("Something went wrong while retreived users");
			}

			set.status = 200;
			return StandardResponse.success(users, "Successfully retreived users");
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ set, params }) => {
		try {
			const user = await userService.getOne(params.id);

			if (!user) {
				throw response.notFound("User not found !");
			}

			set.status = 200;
			return StandardResponse.success(user, "Succesfully retreived data user");
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const payload = {
					name: body.name,
					phone_number: body.phone_number,
					email: body.email,
					password: body.password,
					year_of_experiences: body.year_of_experiences,
					role: body.role,
				};

				const new_account = await userService.create(payload);
				if (!new_account) {
					throw response.badRequest("Error while creating user data");
				}

				set.status = 201;
				return StandardResponse.success(
					new_account,
					"Successfuly creating user data",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				name: t.String({
					minLength: 3,
					maxLength: 30,
					error: "Name must between 2 - 50 characters",
				}),
				email: t.String({ format: "email", error: "Invalid email format" }),
				phone_number: t.String({
					pattern: "^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$",
					error: "Invalid phone number format",
				}),
				password: t.String({
					minLength: 8,
					maxLength: 100,
					error: "Password must be at least 8 characters long",
				}),
				year_of_experiences: t.Integer(),
				role: t.Enum(Roles, {
					min: 1,
					error: "User must have role",
				}),
			}),
		},
	)
	.patch(
		"/sign-out/:id",
		async ({ params, set, cookie: { access_token, refresh_token } }) => {
			try {
				set.status = 203;
				const user = await userService.getOne(params.id);
				await userService.update(params.id, { ...user, refresh_token: null });
				access_token.set({
					value: "",
					maxAge: 0,
					path: "/",
					httpOnly: true,
					secure: true,
				});
				refresh_token.set({
					value: "",
					maxAge: 0,
					path: "/",
					httpOnly: true,
					secure: true,
				});
				return StandardResponse.success("", "Successfully logout");
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
	)
	.patch(
		"/:id",
		async ({ body, params, set }) => {
			try {
				const payload: UpdateUser = {
					name: body.name,
					phone_number: body.phone_number,
					password: body.password,
					year_of_experiences: body.year_of_experiences,
					role: body.role,
					status: body.status,
				};

				const updated_user = await userService.update(params.id, payload);
				if (!updated_user) {
					throw response.badRequest("Error while updating user data");
				}
				set.status = 201;
				return StandardResponse.success(
					updated_user,
					"Successfuly updating user data",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Partial(
				t.Object({
					name: t.String({
						minLength: 3,
						maxLength: 30,
						error: "Name must be between 3 and 30 characters",
					}),
					phone_number: t.String({
						pattern: "^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$",
						error: "Invalid phone number format",
					}),
					password: t.String({
						minLength: 8,
						error: "Password must be at least 8 characters long",
					}),
					year_of_experiences: t.Integer(),
					role: t.Optional(
						t.Enum(Roles, {
							error: "Invalid role value",
						}),
					),
					status: t.Optional(t.Boolean()),
				}),
			),
		},
	)
	.delete("/:id", async ({ params, set }) => {
		try {
			set.status = 204;
			await userService.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
