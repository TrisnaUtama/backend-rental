export class HashService {
	async hash(payload: string) {
		return await Bun.password.hash(payload, "bcrypt");
	}
}
