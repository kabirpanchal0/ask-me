"use client";

export default function CustomButton({
    children,
    onClick,
    href,
    className = "",
    type = "button",
    variant = "primary", // primary | secondary
}: any) {
    const baseStyle =
        "px-4 py-2 rounded-md transition duration-300 cursor-pointer";

    const variants = {
        primary:
            "border-black text-black hover:bg-black hover:text-white",
        secondary:
            "border-gray-400 text-black bg-white  hover:bg-transparent hover:text-white",
        icon:
            "!rounded-2xl !p-2 bg-white text-black border-2 border-gray-400"
    };

    const finalClass = `${baseStyle} ${variants[variant  as keyof typeof variants]} ${className}`;

    // Use CSS variable for button background when available (theme-aware)
    const styleObj: any = { background: 'var(--button-bg, transparent)', color: 'var(--button-text)' };

    // Link
    if (href) {
        return (
            <a href={href} className={finalClass} style={styleObj}>
                {children}
            </a>
        );
    }

    // Button
    return (
        <button type={type} onClick={onClick} className={finalClass} style={styleObj}>
            {children}
        </button>
    );
}