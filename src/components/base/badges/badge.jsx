import { twMerge } from "tailwind-merge";

const badgeVariants = {
    primary: "bg-brand-50 text-brand-700 ring-brand-600/20",
    success: "bg-success-50 text-success-700 ring-success-600/20",
    error: "bg-error-50 text-error-700 ring-error-600/20",
    warning: "bg-warning-50 text-warning-700 ring-warning-600/20",
    gray: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

const badgeSizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-sm",
};

export const Badge = ({
    children,
    variant = "gray",
    size = "md",
    className,
    icon: Icon,
    ...props
}) => {
    return (
        <span
            className={twMerge(
                "inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset",
                badgeVariants[variant],
                badgeSizes[size],
                className
            )}
            {...props}
        >
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
};

