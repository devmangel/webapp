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
                primary: "#fbbf24", // Ámbar 500 - Representa calidad, innovación y enfoque premium. Úsalo como el color principal de la marca, botones destacados y elementos clave.
                secondary: "#d97706", // Ámbar 600 - Para contrastes secundarios y elementos destacados como subtítulos o etiquetas importantes.
                accentPrimary: "#fbbf24", // Ámbar 400 - Acentos vibrantes en botones, enlaces interactivos y llamados a la acción (CTA).
                accentSecondary: "#0d9488", // Teal 700 - Proporciona un toque fresco y moderno. Ideal para enlaces secundarios o detalles decorativos.
                gray: {
                    300: "#D1D5DB", // Grises claros, ideales para bordes, separadores o fondos sutiles que no compitan con el contenido.
                    600: "#4B5563", // Grises medios para texto secundario y subtítulos en ambas versiones (claro y oscuro).
                    900: "#111827", // Gris oscuro, perfecto para encabezados y texto principal en modo claro, aportando profesionalismo y seriedad.
                },
                background: {
                    light: "#fef3c7", // Ámbar 50 - Fondo principal en modo claro, cálido y acogedor, que favorece una experiencia amigable.
                    dark: "#121212", // Negro Mate - Fondo principal en modo oscuro, elegante y enfocado en destacar el contenido.
                },
                foreground: {
                    light: "#111827", // Gris oscuro - Encabezados y texto destacado en modo claro. Ofrece un contraste nítido con el fondo claro.
                    dark: "#fef3c7", // Ámbar 100 - Encabezados y texto destacado en modo oscuro, cálido y fácil de leer en entornos oscuros.
                },
                textPrimary: {
                    light: "#4B5563", // Gris 600 - Texto principal en modo claro, moderno y profesional. Ideal para párrafos y contenido importante.
                    dark: "#E5E7EB", // Gris 300 - Texto principal en modo oscuro, de alta legibilidad sin cansar la vista.
                },
                textSecondary: {
                    light: "#6B7280", // Gris 500 - Texto secundario en modo claro, usado para contenido menos destacado o notas.
                    dark: "#9CA3AF", // Gris 400 - Texto secundario en modo oscuro, con contraste equilibrado para subtítulos o descripciones.
                },
                neutral: {
                    light: "#F9FAFB", // Blanco Cálido - Fondos secundarios en modo claro, ideales para secciones internas o tarjetas.
                    dark: "#1B1B1B", // Gris Oscuro - Fondos secundarios en modo oscuro, suave pero contrastante para destacar contenido.
                },
                border: {
                    light: "#E5E7EB", // Gris Claro - Bordes ligeros en modo claro, sutiles y modernos para no competir con el contenido.
                    dark: "#4B5563", // Gris Medio - Bordes oscuros en modo oscuro, bien definidos para enmarcar elementos visuales.
                },
                amber: {
                    50: "#fffbeb", // Ámbar Claro - Ideal para fondos ligeros y suaves, perfectos para resaltar secciones.
                    100: "#fef3c7", // Ámbar Suave - Úsalo para elementos decorativos o efectos de hover suaves.
                    200: "#fde68a", // Ámbar Pastel - Detalles sutiles en gráficos o indicadores.
                    300: "#fcd34d", // Ámbar Medio - Acentos visuales en gráficos o iconografía.
                    400: "#fbbf24", // Ámbar 400 - Resalta botones o enlaces interactivos.
                    500: "#f59e0b", // Base principal para botones, CTA y elementos interactivos clave.
                    600: "#d97706", // Ámbar Intenso - Detalles de alto contraste para etiquetas o advertencias.
                    700: "#b45309", // Ámbar Profundo - Íconos y acentos oscuros en gráficos.
                    800: "#92400e", // Ámbar Muy Oscuro - Textos destacados o efectos de sombreado.
                    900: "#78350f", // Ámbar Intenso Oscuro - Elementos decorativos en modo oscuro.
                    950: "#451a03", // Ámbar Oscuro - Ideal para acentos en modo oscuro, como bordes o detalles de alto contraste.
                },
            },
            clipPath: {
                myCustomShape: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
            },
        },
    },
    plugins: [],
};