import path from "node:path";
import { defineConfig, loadEnv, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// JSX lives in .js files (App.js, index.js). Vite picks the language from the file
// extension, so compile JSX in src/**/*.js explicitly.
function jsxInJs() {
  return {
    name: "jsx-in-js",
    enforce: "pre",
    async transform(code, id) {
      const [file] = id.split("?");
      if (!/\/src\/.*\.js$/.test(file) || file.includes("/node_modules/")) return null;
      return transformWithOxc(code, file, { lang: "jsx", jsx: { runtime: "automatic" } });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, ["REACT_APP_", "VITE_"]);
  return {
    plugins: [jsxInJs(), react(), tailwindcss()],
    // REACT_APP_* is the frontend env convention (frontend/.env*).
    envPrefix: ["VITE_", "REACT_APP_"],
    // App code reads `process.env.REACT_APP_*`; inline each key as a compile-time constant.
    define: Object.fromEntries(
      Object.entries(env)
        .filter(([key]) => key.startsWith("REACT_APP_"))
        .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
    ),
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
    },
    // Pre-bundle shipped dependencies up front so the dev server does not re-optimize mid-session.
    optimizeDeps: {
      // The dependency scanner runs without user plugins, so tell it src/**/*.js carries JSX.
      rolldownOptions: { moduleTypes: { ".js": "jsx" } },
      include: [
        "@hookform/resolvers",
        "@hookform/resolvers/zod",
        "@radix-ui/react-accordion",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-aspect-ratio",
        "@radix-ui/react-avatar",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-collapsible",
        "@radix-ui/react-context-menu",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-hover-card",
        "@radix-ui/react-label",
        "@radix-ui/react-menubar",
        "@radix-ui/react-navigation-menu",
        "@radix-ui/react-popover",
        "@radix-ui/react-progress",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-scroll-area",
        "@radix-ui/react-select",
        "@radix-ui/react-separator",
        "@radix-ui/react-slider",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tabs",
        "@radix-ui/react-toast",
        "@radix-ui/react-toggle",
        "@radix-ui/react-toggle-group",
        "@radix-ui/react-tooltip",
        "@tanstack/react-query",
        "axios",
        "class-variance-authority",
        "clsx",
        "cmdk",
        "date-fns",
        "date-fns/locale",
        "dayjs",
        "embla-carousel-react",
        "framer-motion",
        "input-otp",
        "lodash",
        "lodash/debounce",
        "lucide-react",
        "next-themes",
        "prop-types",
        "react",
        "react-day-picker",
        "react-dom/client",
        "react-hook-form",
        "react-is",
        "react-resizable-panels",
        "react-router",
        "react-router-dom",
        "recharts",
        "sonner",
        "swr",
        "tailwind-merge",
        "uuid",
        "vaul",
        "zod",
      ],
    },
    // Production bundle lands in build/, not dist/.
    build: { outDir: "build" },
    server: { host: true, port: 3000 },
  };
});
