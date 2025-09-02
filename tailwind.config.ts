module.exports = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/app/components/**/*.{js,ts,jsx,tsx}",
        "./src/app/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            clipPath: {
                myCustomShape: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
            },
        },
    },
    plugins: [],
};