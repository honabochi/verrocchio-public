import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { classifyWork } from "./worker/capobottega.js";

function capobottegaDev(mode) {
  const environment = loadEnv(mode, process.cwd(), "");

  return {
    name: "verrocchio-capobottega-dev",
    configureServer(server) {
      server.middlewares.use("/api/capobottega", async (request, response) => {
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: "Method not allowed." }));
          return;
        }

        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            if (size > 16_000) throw Object.assign(new Error("Request is too large."), { status: 413 });
            chunks.push(chunk);
          }
          const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          const decision = await classifyWork(payload, {
            apiKey: environment.OPENAI_API_KEY,
          });
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(JSON.stringify(decision));
        } catch (error) {
          response.statusCode = error instanceof SyntaxError ? 400 : Number(error?.status) || 500;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(
            JSON.stringify({
              error: error instanceof SyntaxError ? "Request must be valid JSON." : error.message,
              code: error?.code || "capobottega_error",
            }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), capobottegaDev(mode)],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.js",
  },
}));
