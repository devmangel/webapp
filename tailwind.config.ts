module.exports = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/app/components/**/*.{js,ts,jsx,tsx}",
        "./src/app/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#fbbf24",
                secondary: "#d97706",
                accentPrimary: "#fbbf24",
                accentSecondary: "#0d9488",
                gray: {
                    300: "#D1D5DB",
                    600: "#4B5563",
                    900: "#111827",
                },
                background: {
                    light: "#fef3c7",
                    dark: "#121212",
                },
                foreground: {
                    light: "#111827",
                    dark: "#fef3c7",
                },
                textPrimary: {
                    light: "#4B5563",
                    dark: "#E5E7EB",
                },
                textSecondary: {
                    light: "#6B7280",
                    dark: "#9CA3AF",
                },
                neutral: {
                    light: "#F9FAFB",
                    dark: "#1B1B1B",
                },
                border: {
                    light: "#E5E7EB",
                    dark: "#4B5563",
                },
                amber: {
                    50: "#fffbeb",
                    100: "#fef3c7",
                    200: "#fde68a",
                    300: "#fcd34d",
                    400: "#fbbf24",
                    500: "#f59e0b",
                    600: "#d97706",
                    700: "#b45309",
                    800: "#92400e",
                    900: "#78350f",
                    950: "#451a03",
                },
            },
            clipPath: {
                myCustomShape: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
            },
        },
    },
    plugins: [],
};