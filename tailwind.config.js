/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eefbf4",
          100: "#d5f5e3",
          200: "#aeeacc",
          300: "#79d9ad",
          400: "#41c18a",
          500: "#1ea870",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        gold: {
          50: "#fdfbf2",
          100: "#faf3d9",
          200: "#f5e6b8",
          300: "#efd48e",
          400: "#e6be5a",
          500: "#d4a017",
          600: "#b8860b",
          700: "#946b09",
          800: "#7a570e",
          900: "#654712",
        },
        surface: {
          DEFAULT: "#FDFBF7",
          warm: "#FAF6EE",
          card: "#FFFFFF",
          muted: "#F5F0E8",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          secondary: "#6B6B6B",
          muted: "#9B9B9B",
          inverse: "#FDFBF7",
        },
        border: {
          DEFAULT: "#E8E2D9",
          light: "#F0EBE3",
          dark: "#D4CCC0",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-playfair)", "Georgia", "serif"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(26,26,26,0.04)",
        card: "0 2px 8px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)",
        "card-hover": "0 8px 24px rgba(26,26,26,0.08), 0 2px 8px rgba(26,26,26,0.04)",
        elevated: "0 8px 24px rgba(26,26,26,0.08), 0 2px 8px rgba(26,26,26,0.04)",
        float: "0 16px 48px rgba(26,26,26,0.12)",
        "gold-glow": "0 0 0 1px rgba(212,160,23,0.3), 0 4px 16px rgba(212,160,23,0.1)",
        "emerald-glow": "0 0 20px rgba(5,150,105,0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scaleIn 0.25s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        bounceSubtle: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
