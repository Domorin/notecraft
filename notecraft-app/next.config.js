/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");

const envPath =
	process.env.NODE_ENV === "production" ? "../.env.prod" : "../.env.local";

dotenv.config({ path: path.join(__dirname, envPath) });

const nextConfig = {
	distDir: "build",
};

module.exports = nextConfig;
