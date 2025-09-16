module.exports = {
    darkMode: "class",
    content: [        
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
                error: {
                    light: "#FEF2F2",
                    DEFAULT: "#EF4444",
                    dark: "#DC2626",
                    text: "#991B1B",
                },
                success: {
                    light: "#F0FDF4",
                    DEFAULT: "#22C55E",
                    dark: "#16A34A",
                    text: "#15803D",
                },
                warning: {
                    light: "#FFFBEB",
                    DEFAULT: "#F59E0B",
                    dark: "#D97706",
                    text: "#B45309",
                },
            },
            clipPath: {
                myCustomShape: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
            },
        },
    },
    plugins: [],
};
