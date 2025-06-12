import { RatedEntityType, Roles } from "@prisma/client";
import jwt from "@elysiajs/jwt";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import type {
	UpdatePromo,
	CreatePromo,
} from "../../infrastructure/entity/types";
import { Elysia, t } from "elysia";
import { userService, promoService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { response } from "../../application/instances";
import { Decimal } from "@prisma/client/runtime/library";

export const promoRoute = new Elysia({
	prefix: "/v1/promo",
	detail: {
		tags: ["PROMO"],
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
			const promo = await promoService.getAll();
			if (!promo) {
				throw response.badRequest(
					"Something went wrong while retreived promos",
				);
			}

			set.status = 200;
			return StandardResponse.success(promo, "Successfully retreived promos");
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ set, params }) => {
		try {
			const promo = await promoService.getOne(params.id);

			if (!promo) {
				throw response.notFound("promo not found !");
			}

			set.status = 200;
			return StandardResponse.success(
				promo,
				"Succesfully retreived data promo",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const payload: CreatePromo = {
					code: body.code,
					description: body.description,
					discount_value: body.discount_value,
					start_date: new Date(body.start_date),
					end_date: new Date(body.end_date),
					min_booking_amount: new Decimal(body.min_booking_amount),
					status: true,
				};

				const new_promo = await promoService.create(payload);

				if (!new_promo) {
					throw response.badRequest("Error while creating promo data");
				}

				set.status = 201;
				return StandardResponse.success(
					new_promo,
					"Successfully created promo",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				code: t.String({
					minLength: 3,
					maxLength: 20,
					error: "Promo code must be between 3 and 20 characters",
				}),
				description: t.String({
					minLength: 5,
					error: "Description is required and must be at least 5 characters",
				}),
				discount_value: t.Integer({
					minimum: 1,
					maximum: 100,
					error: "Discount value must be between 1 and 100",
				}),
				start_date: t.String({
					format: "date-time",
					error: "Start date must be a valid ISO date",
				}),
				end_date: t.String({
					format: "date-time",
					error: "End date must be a valid ISO date",
				}),
				min_booking_amount: t.String({
					error: "Minimal booking amount is required",
				}),
				status: t.Optional(t.Boolean()),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ body, set, params }) => {
			try {
				const payload: UpdatePromo = {
					code: body.code,
					description: body.description,
					discount_value: body.discount_value,
					start_date: new Date(body.start_date),
					end_date: new Date(body.end_date),
					min_booking_amount: new Decimal(body.min_booking_amount),
					status: true,
				};
				const new_promo = await promoService.update(params.id, payload);
				if (!new_promo) {
					throw response.badRequest("Error while creating promo data");
				}

				set.status = 201;
				return StandardResponse.success(
					new_promo,
					"Successfully created promo",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				code: t.String({
					minLength: 3,
					maxLength: 20,
					error: "Promo code must be between 3 and 20 characters",
				}),
				description: t.String({
					minLength: 5,
					error: "Description is required and must be at least 5 characters",
				}),
				discount_value: t.Integer({
					minimum: 1,
					maximum: 100,
					error: "Discount value must be between 1 and 100",
				}),
				start_date: t.String({
					format: "date-time",
					error: "Start date must be a valid ISO date",
				}),
				end_date: t.String({
					format: "date-time",
					error: "End date must be a valid ISO date",
				}),
				min_booking_amount: t.String({
					error: "Minimal booking amount is required",
				}),
				status: t.Optional(t.Boolean()),
			}),
		},
	)
	.delete("/:id", async ({ params, set }) => {
		try {
			set.status = 204;
			await promoService.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
