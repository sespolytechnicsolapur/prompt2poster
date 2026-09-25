/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        surface: "var(--bg-surface)",
        "surface-subtle": "var(--bg-surface-subtle)",
        "surface-hover": "var(--bg-surface-hover)",
        "surface-active": "var(--bg-surface-active)",
        
        border: "var(--border-color)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        dim: "var(--text-dim)",
        inverse: "var(--text-inverse)",
        
        accent: "var(--accent-primary)",
        "accent-hover": "var(--accent-primary-hover)",
        "accent-subtle": "var(--accent-primary-subtle)",
        
        success: "var(--status-success)",
        "success-subtle": "var(--status-success-subtle)",
        warning: "var(--status-warning)",
        "warning-subtle": "var(--status-warning-subtle)",
        danger: "var(--status-danger)",
        "danger-subtle": "var(--status-danger-subtle)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        sketchy: "var(--shadow-sketchy)",
      },
      borderRadius: {
        sketchy: "var(--radius-sketchy)",
        "sketchy-btn": "var(--radius-sketchy-btn)",
        "sketchy-card": "var(--radius-sketchy-card)",
        blob: "var(--radius-blob)",
      },
    },
  },
  plugins: [],
}
