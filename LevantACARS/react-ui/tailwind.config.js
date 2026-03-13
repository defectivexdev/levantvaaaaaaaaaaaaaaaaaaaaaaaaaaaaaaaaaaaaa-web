/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#0b1120',
                panel: '#111827',
                primary: {
                    DEFAULT: '#2563eb',
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                secondary: {
                    DEFAULT: '#22c55e',
                },
                text: {
                    DEFAULT: '#e5e7eb',
                },
                accent: {
                    gold: '#D4AF37',
                    bronze: '#CD7F32',
                },
                dark: {
                    900: '#0b1120',
                    800: '#111827',
                    700: '#1e293b',
                    600: '#334155',
                    500: '#475569',
                }
            },
            fontFamily: {
                sans: ['var(--font-winky)', 'var(--font-manrope)', 'Sour Gummy', 'system-ui', 'sans-serif'],
                display: ['var(--font-shadows)', 'cursive', 'sans-serif'],
                manrope: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            rotate: {
                '120': '120deg',
                '240': '240deg',
            },
        },
    },
    plugins: [],
}
