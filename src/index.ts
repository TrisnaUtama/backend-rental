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
const app = new Elysia();
app
	.use(
		cors({
			origin: "localhost:5173",
			methods: ["GET", "POST", "PATCH", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.use(
		staticPlugin({
			prefix: "/",
			assets: process.env.STORAGE_PATH,
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
			.use(ratingRoute),
	)
	.listen({ port: 8000, hostname: "0.0.0.0" });
console.log(
	`🦊 🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} 🦊 🦊`,
);
