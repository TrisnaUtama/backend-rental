import { MidtransClient } from "midtrans-node-client";
import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export class MidtransService {
	private core: InstanceType<typeof MidtransClient.Snap>;

	constructor() {
		this.core = new MidtransClient.Snap({
			isProduction: false,
			serverKey: process.env.MIDTRANS_SERVER_KEY,
			clientKey: process.env.MIDTRANS_CLIENT_KEY,
		});
	}

	async charge(payload: any) {
		return this.core.createTransactionToken(payload);
	}

	async getTransactionStatus(orderId: string) {
		return this.core.transaction.status(orderId);
	}

	async parseNotification(body: any) {
		return {
			orderId: body.order_id,
			transactionStatus: body.transaction_status,
			fraudStatus: body.fraud_status,
		};
	}
}
