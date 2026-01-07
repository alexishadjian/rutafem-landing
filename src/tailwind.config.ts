import type { Config } from 'tailwindcss';

export default {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './_components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,jsx,ts,tsx}',
        './node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
            },
        },
    },
    plugins: [],
} satisfies Config;
