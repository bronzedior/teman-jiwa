import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Split the heavy shell dependencies so no chunk exceeds 500 kB and each caches independently.
                manualChunks: {
                    react: ["react", "react-dom", "react-dom/client"],
                    router: ["react-router"],
                    motion: ["motion"],
                },
            },
        },
    },
});

