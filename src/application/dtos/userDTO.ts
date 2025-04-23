import type { Users } from "@prisma/client";

export class UserDTO {
	private user: Users;

	constructor(user: Users) {
		this.user = user;
	}

	fromEntity() {
		return {
			user_id: this.user.id,
			name: this.user.name,
			phone_number: this.user.phone_number,
			email: this.user.email,
			role: this.user.role,
			is_verified: this.user.is_verified,
			status: this.user.status,
			year_of_experiences: this.user.year_of_experiences,
		};
	}
}
