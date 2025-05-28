import { Elysia, t } from "elysia";
import { authService, otpService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import {
	ACCESS_TOKEN_EXP,
	REFRESH_TOKEN_EXP,
} from "../../infrastructure/utils/constant";
import { response } from "../../application/instances";
import { signJwt } from "../../infrastructure/utils/jwt";

export const authRouter = new Elysia({
	prefix: "/v1",
	detail: {
		tags: ["AUTH"],
	},
})
	.post(
		"/",
		async ({ set, body }) => {
			try {
				const user_otp = await otpService.getOne(body.user_id);
				if (!user_otp) {
					set.status = 400;
					throw response.badRequest("Invalid OTP code !");
				}
				set.status = 200;
				return StandardResponse.success(
					user_otp,
					"Successfully retreived user otp",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				user_id: t.String(),
			}),
		},
	)
	.post(
		"/sign-up",
		async ({ body, set }) => {
			try {
				const payload = {
					name: body.name,
					email: body.email,
					phone_number: body.phone_number,
					password: body.password,
				};

				const new_account = await authService.signUp(payload);
				set.status = 201;
				return StandardResponse.success(
					new_account,
					"Account created successfully",
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
					error: "Name must between 3 - 30 characters",
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
			}),
		},
	)
	.post(
		"/verify",
		async ({ body, set }) => {
			try {
				const verify = await authService.verification(body.code, body.user_id);

				set.status = 405;
				if (!verify) throw response.badRequest("Invalid OTP code !");

				set.status = 200;
				return StandardResponse.success("", "account succesfully verified");
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				code: t.String(),
				user_id: t.String(),
			}),
		},
	)
	.post(
		"/resend-otp",
		async ({ body, set }) => {
			try {
				await authService.sendOtp(body.id, body.email);
				set.status = 201;
				return StandardResponse.success("succesfully resend otp code");
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				email: t.String(),
				id: t.String(),
			}),
		},
	)
	.post(
		"/sign-in",
		async ({ body, set, cookie: { access_token, refresh_token } }) => {
			try {
				const login_user = await authService.signIn(body.email, body.password);
				if (!login_user) {
					set.status = 401;
					throw response.badRequest("Error while trying to login !");
				}
				refresh_token.set({
					value: login_user.refresh_token,
					httpOnly: true,
					secure: true,
					sameSite: "none",
					maxAge: REFRESH_TOKEN_EXP,
					path: "/",
				});
				access_token.set({
					value: login_user.access_token,
					httpOnly: false,
					secure: true,
					sameSite: "none",
					maxAge: ACCESS_TOKEN_EXP,
					path: "/",
				});
				set.status = 200;
				return StandardResponse.login(
					login_user.user,
					login_user.access_token,
					"Successfuly Login",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				email: t.String({ format: "email", error: "Invalid Email Format" }),
				password: t.String({ minLength: 2, error: "Invalid Password Format" }),
			}),
		},
	)
	.post("/refresh", async ({ set, cookie }) => {
		try {
			const refreshToken = cookie.refresh_token;
			console.log("route refrsh : ", refreshToken);
			if (!refreshToken) {
				set.status = 401;
				throw response.unauthorized("Unauthorized");
			}
			const token = await authService.refresh(refreshToken.toString());
			set.status = 200;
			return StandardResponse.login(
				token.user,
				token.access_token,
				"Successfully Refreshed",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
