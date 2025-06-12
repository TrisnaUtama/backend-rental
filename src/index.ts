import { Elysia } from "elysia";
import { authRouter } from "./presentation/router/auth.route";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { userRoute } from "./presentation/router/user.route";
import { notificationRoute } from "./presentation/router/notification.route";
import { vehicleRoute } from "./presentation/router/vehicle.route";
import { destinationRoute } from "./presentation/router/destination.route";
import { travelRoute } from "./presentation/router/travel.route";
import { bookingRoute } from "./presentation/router/booking.route";
import { paymentRoute } from "./presentation/router/payment.route";
import { storageRoute } from "./presentation/router/storage.route";
import staticPlugin from "@elysiajs/static";
import { ratingRoute } from "./presentation/router/rating.route";
import { accomodationRoute } from "./presentation/router/accomodation.route";
import { recommendationRoute } from "./presentation/router/recomendation.route";
import { StandardResponse } from "./infrastructure/utils/response/standard.response";
import { BaseHttpError } from "./infrastructure/utils/response/base.response";
import { refundRoute } from "./presentation/router/refund.route";
import { promoRoute } from "./presentation/router/promo.route";

const app = new Elysia();

app
	.onError(({ code, error, set }) => {
		console.error("Elysia Error caught:", code, error);

		if (code === "VALIDATION") {
			set.status = 422;
			return StandardResponse.error("Validation Failed", 422, error.message);
		}

		if (error instanceof BaseHttpError) {
			set.status = error.statusCode;
			return StandardResponse.error(error.message, error.statusCode);
		}

		set.status = 500;
		return StandardResponse.error("Internal Server Error", 500);
	})

	.use(
		cors({
			origin: "localhost:5173",
			methods: ["GET", "POST", "PATCH", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.use(
		swagger({
			path: "/docs",
		}),
	)
	.group("/api", (app) =>
		app
			.use(authRouter)
			.use(userRoute)
			.use(notificationRoute)
			.use(vehicleRoute)
			.use(destinationRoute)
			.use(travelRoute)
			.use(bookingRoute)
			.use(paymentRoute)
			.use(storageRoute)
			.use(accomodationRoute)
			.use(recommendationRoute)
			.use(ratingRoute)
			.use(refundRoute)
			.use(promoRoute),
	)
	.use(
		staticPlugin({
			prefix: "/",
			assets: process.env.STORAGE_PATH,
		}),
	)
	.listen({ port: 8000, hostname: "0.0.0.0" });

console.log(
	`🦊 🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} 🦊 🦊`,
);

export { StandardResponse };
