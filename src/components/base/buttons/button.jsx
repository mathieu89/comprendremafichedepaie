import { Button as AriaButton } from "react-aria-components";
import { twMerge } from "tailwind-merge";

const buttonVariants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    tertiary: "bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    destructive: "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500",
};

const buttonSizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
    xl: "px-6 py-3.5 text-base",
};

export const Button = ({
    children,
    variant = "primary",
    size = "md",
    className,
    iconLeading: IconLeading,
    iconTrailing: IconTrailing,
    isDisabled,
    ...props
}) => {
    return (
        <AriaButton
            className={twMerge(
                "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                buttonVariants[variant],
                buttonSizes[size],
                className
            )}
            isDisabled={isDisabled}
            {...props}
        >
            {IconLeading && <IconLeading className="w-5 h-5" />}
            {children}
            {IconTrailing && <IconTrailing className="w-5 h-5" />}
        </AriaButton>
    );
};

