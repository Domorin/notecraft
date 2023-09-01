import * as fs from "fs";
import * as path from "path";

function generateEnvTypes() {
	let currentDir = process.env.PWD;

	if (!currentDir) {
		throw new Error("No currentDir found");
	}

	let loopCount = 0;
	while (!fs.existsSync(path.join(currentDir, ".env.template"))) {
		currentDir = path.join(currentDir, "..");
		loopCount++;
		// Safety check
		if (loopCount > 10) {
			throw new Error("Could not find .env.template");
		}
	}

	fs.readFile(`${currentDir}/.env.template`, "utf8", (err, data) => {
		const envLines = data
			.split("\n")
			.filter((line) => line.length > 0 && !line.startsWith("#"))
			.map((val) => val.split("=")[0]);

		const resultFile = `export type EnvVars = ${envLines
			.map((val) => `"${val}"`)
			.join(" | ")};`;

		fs.writeFileSync(
			`${currentDir}/notecraft-common/src/env/types.ts`,
			resultFile
		);
	});
}

generateEnvTypes();
