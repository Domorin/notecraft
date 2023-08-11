import { ForwardedRef, RefObject, useLayoutEffect } from "react";

export function useAttachChildToParent<
	Parent extends RefObject<HTMLElement> | ForwardedRef<HTMLElement>,
	Child extends RefObject<HTMLElement> | ForwardedRef<HTMLElement>
>(
	parent: Parent | null,
	child: Child | null,
	getPosition: (
		parent: DOMRect,
		child: DOMRect
	) => { relativeX: number; relativeY: number }
) {
	useLayoutEffect(() => {
		const setPosition = () => {
			if (typeof child === "function" || !child?.current) {
				return;
			}

			if (typeof parent === "function" || !parent?.current) {
				return;
			}

			const { left, top } = parent.current.getBoundingClientRect();

			const { relativeX, relativeY } = getPosition(
				parent.current.getBoundingClientRect(),
				child.current.getBoundingClientRect()
			);

			child.current.style.left = `${left + relativeX}px`;
			child.current.style.top = `${top + relativeY}px`;
		};

		setPosition();

		window.addEventListener("resize", setPosition);

		return () => window.removeEventListener("resize", setPosition);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parent, child]);
}
