import { EnvVars } from "./types.js";

function GetEnvVar(envVar: EnvVars): string;
function GetEnvVar(envVar: EnvVars, canBeUndefined: false): string;
function GetEnvVar(envVar: EnvVars, canBeUndefined: true): string | undefined;
function GetEnvVar(envVar: EnvVars, canBeUndefined = false) {
	const result = process.env[envVar];

	if (!canBeUndefined && !result) {
		throw new Error(`Environment variable ${envVar} is not defined!`);
	}

	return result;
}

export default GetEnvVar;
