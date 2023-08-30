export function ModalHeader(props: { children: React.ReactNode }) {
	return (
		<div className="mb-4 flex flex-col items-center text-2xl font-bold">
			{props.children}
		</div>
	);
}
