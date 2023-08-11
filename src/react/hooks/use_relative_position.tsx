import { ForwardedRef, RefObject, useLayoutEffect } from "react";

/**
 *
 * @param getPosition Relative to the **center** of the parent
 */
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

			const parentRect = parent.current.getBoundingClientRect();
			const childRect = child.current.getBoundingClientRect();

			const { relativeX, relativeY } = getPosition(parentRect, childRect);

			const baseY =
				parentRect.top + parentRect.height / 2 - childRect.height / 2;

			let desiredTop = baseY + relativeY;
			if (desiredTop + childRect.height > window.innerHeight) {
				desiredTop = baseY - relativeY;
			}

			child.current.style.left = `${
				parentRect.left +
				parentRect.width / 2 -
				childRect.width / 2 +
				relativeX
			}px`;
			child.current.style.top = `${desiredTop}px`;
		};

		setPosition();

		window.addEventListener("resize", setPosition);

		return () => window.removeEventListener("resize", setPosition);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parent, child]);
}
