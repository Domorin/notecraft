import Document, {
	DocumentContext,
	DocumentInitialProps,
	Head,
	Html,
	Main,
	NextScript,
} from "next/document";
import * as cookie from "cookie";

export default function MyDocument(
	props: DocumentInitialProps & { theme: string }
) {
	console.log("theme", props.theme);

	return (
		<Html lang="en" data-theme={props.theme}>
			<Head />
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
	const initialProps = await Document.getInitialProps(ctx);

	const theme = cookie.parse(ctx.req?.headers.cookie || "")["theme"];

	return { ...initialProps, theme };
};
