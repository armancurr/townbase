function SpinnerIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="32"
			height="32"
			fill="#ffffff"
			viewBox="0 0 256 256"
			aria-hidden="true"
		>
			<path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm88,88H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z" />
		</svg>
	);
}

type LoadingOverlayProps = {
	isVisible: boolean;
};

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
	if (!isVisible) {
		return null;
	}

	return (
		<div
			className="absolute inset-0 z-[1] grid place-items-center content-center gap-3 text-sm text-[#f7fbf2] pointer-events-none"
			role="status"
			aria-live="polite"
			aria-label="Preparing world"
		>
			<span className="grid h-11 w-11 place-items-center animate-[editor-spinner-spin_0.9s_linear_infinite] motion-reduce:animate-[editor-spinner-spin_1.8s_linear_infinite] [&_svg]:block [&_svg]:h-10 [&_svg]:w-10 [&_svg]:drop-shadow-[0_2px_8px_rgba(23,32,29,0.24)]">
				<SpinnerIcon />
			</span>
			<span>Preparing world...</span>
		</div>
	);
}
