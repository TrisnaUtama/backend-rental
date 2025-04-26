import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadTemplate(
	templateName: string,
	replacements: Record<string, string>,
): Promise<string> {
	const templatePath = path.join(
		__dirname,
		"..",
		"utils",
		"templates",
		`${templateName}.html`,
	);

	const file = Bun.file(templatePath);
	let template = await file.text();

	for (const [key, value] of Object.entries(replacements)) {
		const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
		template = template.replace(regex, value);
	}

	return template;
}
