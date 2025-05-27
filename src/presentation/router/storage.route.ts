import jwt from "@elysiajs/jwt";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import { Elysia, t } from "elysia";
import { userService, storageService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { response } from "../../application/instances";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

export const storageRoute = new Elysia({
	prefix: "/v1/storages",
	detail: {
		tags: ["STORAGE"],
	},
})
	// .use(
	// 	jwt({
	// 		name: `${process.env.JWT_NAME}`,
	// 		secret: `${process.env.JWT_SECRET_KEY}`,
	// 	}),
	// )
	// .derive(async ({ cookie: { access_token }, set }) => {
	// 	if (!access_token.value) {
	// 		set.status = 401;
	// 		throw response.unauthorized();
	// 	}
	// 	const jwtPayload: IJwtPayload = verifyJwt(access_token.value.toString());

	// 	if (!jwtPayload) {
	// 		set.status = 403;
	// 		throw response.forbidden();
	// 	}

	// 	const userId = jwtPayload.user_id;
	// 	if (!userId) throw response.badRequest("Invalid Payload !");
	// 	const user = await userService.getOne(userId.toString());

	// 	return {
	// 		user,
	// 	};
	// })
	.post(
		"/upload",
		async ({ body, set }) => {
			try {
				const file = body.file;
				console.log(file);
				if (!file) {
					set.status = 400;
					return StandardResponse.error("No file provided", 400);
				}
				const result = await storageService.uploadImage(file);
				return StandardResponse.success(result, "Image uploaded successfully");
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				file: t.File({ format: "image/*" }),
			}),
		},
	)

	.patch(
		"/update",
		async ({ body, set }) => {
			try {
				const { file, oldFilename } = body;
				if (!file) {
					set.status = 400;
					return StandardResponse.error("No file provided", 400);
				}
				if (!oldFilename) {
					set.status = 400;
					return StandardResponse.error("No old filename provided", 400);
				}
				const result = await storageService.updateImage(file, oldFilename);
				return StandardResponse.success(result, "Image updated successfully");
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				file: t.File(),
				oldFilename: t.String(),
			}),
		},
	)

	.get("/:filename", async ({ params, set }) => {
		try {
			const filename = params.filename;
			if (!filename || filename.includes("..") || filename.includes("/")) {
				set.status = 400;
				return StandardResponse.error("Invalid filename", 400);
			}
			const result = await storageService.getImagePath(filename);
			if (!result) {
				set.status = 404;
				return StandardResponse.error("Image not found", 404);
			}
			try {
				await fs.access(result.toString());
			} catch {
				set.status = 404;
				return StandardResponse.error("Image not found", 404);
			}
			const ext = path.extname(result.toString()).toLowerCase();
			const contentTypeMap: { [key: string]: string } = {
				".jpg": "image/jpeg",
				".jpeg": "image/jpeg",
				".png": "image/png",
				".gif": "image/gif",
				".webp": "image/webp",
				".svg": "image/svg+xml",
			};
			const contentType = contentTypeMap[ext] || "application/octet-stream";
			set.headers["Content-Type"] = contentType;
			set.headers["Cache-Control"] = "public, max-age=31536000";
			const filePath = Bun.file(result.toString());
			console.log("route:", filePath);
			return StandardResponse.success(filePath, "Success");
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
// .delete("/:filename", async ({ params, set }) => {
// 	try {
// 		const filename = params.filename;

// 		if (!filename || filename.includes("..") || filename.includes("/")) {
// 			set.status = 400;
// 			return StandardResponse.error("Invalid filename", 400);
// 		}

// 		const result = await storageService.deleteImage(filename);
// 		return StandardResponse.success(result, "Image deleted successfully");
// 	} catch (error) {
// 		set.status = 500;
// 		return GlobalErrorHandler.handleError(error, set);
// 	}
// });
