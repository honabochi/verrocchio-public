import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { defineConfig } from "vite";

const buildRevision = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();

export default defineConfig({
  plugins: [
    react(),
    {
      name: "verrocchio-build-revision",
      transformIndexHtml(html) {
        return html.replace(
          "</head>",
          `    <meta name="verrocchio-revision" content="${buildRevision}" />\n  </head>`,
        );
      },
    },
  ],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.js",
  },
});
