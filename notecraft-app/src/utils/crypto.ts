import { GetEnvVar } from "@notecraft/common";
import Cryptr from "cryptr";

const cryptr = new Cryptr(GetEnvVar("HMAC_SECRET"));

export function encrypt(value: string) {
	return cryptr.encrypt(value);
}

export function decrypt(value: string) {
	return cryptr.decrypt(value);
}
