/** @type {import('next').NextConfig} */

const nextConfig = {
	distDir: "build",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.googleusercontent.com",
				port: "",
				pathname: "**",
			},
		],
	},
};

module.exports = nextConfig;
