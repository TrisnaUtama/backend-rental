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

const app = new Elysia();
app
	.use(
		cors({
			origin: "http://localhost:3000",
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
			.use(bookingRoute),
	)

	.listen(8000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
