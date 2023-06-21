/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      transformOrigin: {
        '0': '0%',
      },
    },
  },
  variants: {},
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.perspective-800': {
          perspective: '800px',
        },
        '.rotate-y-2': {
          transform: 'rotateY(-6deg)',
        },
        '.rotate-y-1': {
          transform: 'rotateY(2deg)',
        },
      });
    },
  ],
};
