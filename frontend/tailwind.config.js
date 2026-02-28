/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#08A698', // Teal - Main Brand Color
                secondary: '#0F766E', // Teal-700
                accent: '#2DD4BF', // Teal-400
                dark: '#111827', // Gray-900 - Sidebar/Dark text
                light: '#F8F9FA', // Gray-50 - Backgrounds
            },
        },
    },
    plugins: [],
}