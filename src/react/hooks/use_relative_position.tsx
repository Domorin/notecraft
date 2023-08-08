import { RefObject, useLayoutEffect } from "react";

export function useAttachChildToParent<
	Parent extends RefObject<HTMLElement>,
	Child extends RefObject<HTMLElement>
>(
	parent: Parent | null,
	child: Child | null,
	getPosition: (
		parent: DOMRect,
		child: DOMRect
	) => { relativeX: number; relativeY: number }
) {
	useLayoutEffect(() => {
		const observer = new MutationObserver(() => {
			setPosition();
		});

		if (parent?.current) {
			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		console.log("effect!");
		const setPosition = () => {
			if (child?.current && parent?.current) {
				const { left, top } = parent.current.getBoundingClientRect();

				const { relativeX, relativeY } = getPosition(
					parent.current.getBoundingClientRect(),
					child.current.getBoundingClientRect()
				);
				console.log("Setting position!", left, top);

				child.current.style.left = `${left + relativeX}px`;
				child.current.style.top = `${top + relativeY}px`;
			}
		};

		setPosition();

		window.addEventListener("resize", setPosition);

		return () => {
			window.removeEventListener("resize", setPosition);
			observer.disconnect();
		};
	}, [parent, child]);
}
