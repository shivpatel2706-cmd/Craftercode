/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: { 50: "#22222C", 100: "#2A2A35", 200: "#41414C", 300: "#777783", 400: "#A7A7B1", 500: "#B6B6BE", 600: "#C7C7CC", 700: "#D5D5D2", 800: "#E2E2DA", 900: "#24242E", 950: "#202027" },
        blue: { 50: "#382f39", 100: "#493640", 200: "#67444f", 300: "#946674", 400: "#B98391", 500: "#B98391", 600: "#946674", 700: "#744552", 800: "#493640", 900: "#382f39", 950: "#28242c" },
        indigo: { 50: "#312e37", 100: "#3b3039", 200: "#57404a", 300: "#805d69", 400: "#B98391", 500: "#B98391", 600: "#946674", 700: "#744552", 800: "#493640", 900: "#382f39", 950: "#28242c" },
        mint: { 50: "#28342f", 100: "#30453a", 200: "#436451", 300: "#679079", 400: "#8bb49b", 500: "#8bb49b", 600: "#679079", 700: "#436451", 800: "#30453a", 900: "#28342f", 950: "#202a25" },
        neutral: { 0: "#2A2A35", 50: "#E2E2DA", 100: "#2A2A35", 150: "#34343F", 200: "#41414C", 300: "#777783", 400: "#A7A7B1", 500: "#B6B6BE", 600: "#C7C7CC", 700: "#D5D5D2", 800: "#E2E2DA", 900: "#24242E", 950: "#202027" },
        amber: { 50: "#3e3729", 100: "#51452e", 200: "#725b34", 300: "#987748", 400: "#c5a66b", 500: "#d0b47e", 600: "#987748", 700: "#725b34", 800: "#51452e", 900: "#3e3729" },
        rose: { 50: "#3d2c32", 100: "#53343d", 200: "#754552", 300: "#a26373", 400: "#c48191", 500: "#c48191", 600: "#a26373", 700: "#754552", 800: "#53343d", 900: "#3d2c32" },
        purple: { 50: "#322f3e", 100: "#40394e", 200: "#554a69", 300: "#74618b", 400: "#9a83af", 500: "#9a83af", 600: "#74618b", 700: "#554a69", 800: "#40394e", 900: "#322f3e" },
      },
      fontFamily: { sans: ["Inter", "Noto Sans", "sans-serif"], mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"] },
      borderRadius: { xl: "12px", "2xl": "12px" },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 16%)",
        "card-md": "0 4px 12px rgb(0 0 0 / 20%)",
        "card-lg": "0 8px 24px rgb(0 0 0 / 24%)",
        "card-xl": "0 16px 40px rgb(0 0 0 / 30%)",
        "inner-soft": "inset 0 1px 3px rgb(0 0 0 / 16%)",
        "glow-blue": "0 0 0 3px rgb(185 131 145 / 22%)",
        "glow-mint": "0 0 0 3px rgb(139 180 155 / 22%)",
      },
      transitionDuration: { 100: "100ms", 150: "150ms", 200: "200ms", 400: "400ms" },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideDown: { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(.98)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
      animation: { "fade-in": "fadeIn 200ms ease-out", "slide-up": "slideUp 200ms ease-out", "slide-down": "slideDown 200ms ease-out", "scale-in": "scaleIn 200ms ease-out" },
    },
  },
  plugins: [],
};
