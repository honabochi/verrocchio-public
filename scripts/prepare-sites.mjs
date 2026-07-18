import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverDirectory = resolve(root, "dist/server");
const hostingDirectory = resolve(root, "dist/.openai");

await mkdir(serverDirectory, { recursive: true });
await mkdir(hostingDirectory, { recursive: true });
await cp(resolve(root, "worker/index.js"), resolve(serverDirectory, "index.js"));
await cp(resolve(root, ".openai/hosting.json"), resolve(hostingDirectory, "hosting.json"));
