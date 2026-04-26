import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Match CRA's default port
    open: true,
  },
  build: {
    outDir: "build", // Match CRA's build folder name
  },
  base: "/morse/",
});
