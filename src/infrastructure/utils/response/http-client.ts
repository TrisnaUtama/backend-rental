export class HttpClient {
	async post<T = any>(url: string, body: any): Promise<T> {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`HTTP ${res.status} - ${errorText}`);
		}

		return res.json();
	}
}