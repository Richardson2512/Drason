import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                // Velvet Ledger type system. `sans` (the Tailwind default
                // body class) maps to Inter; `display` to Outfit; `serif`
                // to Cormorant Garamond italic; `mono` to JetBrains Mono.
                sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
                display: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
                serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
                mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
            },
        },
    },
    plugins: [],
};
export default config;
