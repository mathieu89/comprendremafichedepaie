import { createContext, useContext, useEffect, useState, useMemo } from "react";

const ThemeContext = createContext(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};

export const ThemeProvider = ({ 
    children, 
    defaultTheme = "light", 
    storageKey = "ui-theme", 
    darkModeClass = "dark-mode" 
}) => {
    const [theme, setTheme] = useState(() => {
        if (typeof globalThis.window !== "undefined") {
            const savedTheme = localStorage.getItem(storageKey);
            return savedTheme || defaultTheme;
        }
        return defaultTheme;
    });

    useEffect(() => {
        const applyTheme = () => {
            const root = globalThis.window.document.documentElement;

            if (theme === "system") {
                const systemTheme = globalThis.window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                root.classList.toggle(darkModeClass, systemTheme === "dark");
                localStorage.removeItem(storageKey);
            } else {
                root.classList.toggle(darkModeClass, theme === "dark");
                localStorage.setItem(storageKey, theme);
            }
        };

        applyTheme();

        const mediaQuery = globalThis.window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                applyTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, storageKey, darkModeClass]);

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

