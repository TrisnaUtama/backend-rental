import { Elysia, t } from "elysia";
import { authService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard-error";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global-error-handler";

export const authRouter = new Elysia({ prefix: "/v1" })
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
			}),
		},
	)
	.post(
		"/verify",
		async ({ body, set }) => {
			try {
				const verify = await authService.verification(body.code, body.user_id);

				set.status = 405;
				if (!verify)
					return StandardResponse.error("Invalid OTP code !", set.status);

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
	);
