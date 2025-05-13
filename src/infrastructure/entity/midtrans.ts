import { MidtransClient } from "midtrans-node-client";
import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export class MidtransService {
	private core: InstanceType<typeof MidtransClient.CoreApi>;

	constructor() {
		this.core = new MidtransClient.CoreApi({
			isProduction: false,
			serverKey: process.env.MIDTRANS_SERVER_KEY,
			clientKey: process.env.MIDTRANS_CLIENT_KEY,
		});
	}

	async charge(payload: any) {
		return this.core.charge(payload);
	}

	async getTransactionStatus(orderId: string) {
		return this.core.transaction.status(orderId);
	}
}
