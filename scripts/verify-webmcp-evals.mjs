import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { evaluateWebMcpReceipt } from "./lib/webmcp-eval.mjs";

const receiptPath = process.argv[2];
if (!receiptPath) {
  process.stderr.write("Usage: npm run eval:webmcp -- <receipt.json>\n");
  process.exit(2);
}

let receipt;
try {
  receipt = JSON.parse(await readFile(resolve(receiptPath), "utf8"));
} catch (error) {
  process.stderr.write(`Could not read evaluation receipt: ${error.message}\n`);
  process.exit(2);
}

const summary = evaluateWebMcpReceipt(receipt);
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
process.exitCode = summary.verdict === "PASS" ? 0 : summary.verdict === "FAIL" ? 1 : 2;
