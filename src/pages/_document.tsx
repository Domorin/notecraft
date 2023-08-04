import Document, {
	DocumentContext,
	Head,
	Html,
	Main,
	NextScript,
} from "next/document";
import * as cookie from "cookie";

export default function MyDocument(props: any) {
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

	let theme = cookie.parse(ctx.req?.headers.cookie || "")["theme"];

	return { ...initialProps, theme };
};
