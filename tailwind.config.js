module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Paleta de carta impresa: papel, tinta y achiote como único acento
      colors: {
        paper: {
          DEFAULT: "#F4EEE2",
          deep: "#EBE2D0",
          card: "#FBF8F1",
        },
        ink: {
          DEFAULT: "#1C1915",
          soft: "#4A443C",
          mute: "#857C6F",
          line: "#D8CDB9",
        },
        achiote: {
          DEFAULT: "#B4432A",
          dark: "#8E3320",
          soft: "#F2DDD3",
        },
        olive: {
          DEFAULT: "#56652B",
          soft: "#E3E6CF",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 140ms ease-out",
        "fade-up": "fade-up 260ms ease-out both",
      },
    },
  },
  plugins: [],
}
