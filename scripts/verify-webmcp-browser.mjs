import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.VERROCCHIO_URL || "http://127.0.0.1:5173/";

async function toolNames(page) {
  return page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return tools.map((tool) => tool.name);
  });
}

async function executeTool(page, name, input) {
  return page.evaluate(
    async ({ toolName, toolInput }) => {
      const tools = await document.modelContext.getTools();
      const tool = tools.find((item) => item.name === toolName);
      if (!tool) throw new Error(`Tool not registered: ${toolName}`);
      const result = await document.modelContext.executeTool(
        tool,
        JSON.stringify(toolInput),
      );
      return typeof result === "string" ? JSON.parse(result) : result;
    },
    { toolName: name, toolInput: input },
  );
}

async function waitForTools(page, expected) {
  const sortedExpected = [...expected].sort();
  await page.waitForFunction(
    async (names) => {
      if (!document.modelContext?.getTools) return false;
      const tools = await document.modelContext.getTools();
      return JSON.stringify(tools.map((tool) => tool.name).sort()) === JSON.stringify(names);
    },
    sortedExpected,
  );
}

const browser = await chromium.launch({
  headless: false,
  executablePath: chromePath,
  args: [
    "--enable-experimental-web-platform-features",
    "--enable-features=WebMCPTesting,DevToolsWebMCPSupport",
  ],
});

const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
const warnings = [];
const notFound = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() === 404) notFound.push(response.url());
});
page.on("console", (message) => {
  if (message.type() === "error") {
    errors.push({ text: message.text(), location: message.location() });
  }
  if (message.type() === "warning") warnings.push(message.text());
});

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "LOAD WEBMCP MISSION" }).click();
  await page.getByRole("button", { name: "GIORNATE work" }).click();
  await waitForTools(page, [
    "inspect_workshop",
    "call_fermo",
    "forge_workshop_draft",
    "return_work_result",
  ]);

  const initialTools = await toolNames(page);
  const beforeFermo = await executeTool(page, "inspect_workshop", { view: "summary" });
  const fermoReceipt = await executeTool(page, "call_fermo", {
    reason: "The evidence target is ambiguous; pause for human direction.",
    expectedStateVersion: beforeFermo.stateVersion,
    idempotencyKey: "browser-fermo-1",
  });
  await waitForTools(page, ["inspect_workshop"]);
  await page.getByText("FERMO ACTIVE · 人間の判断待ち").waitFor();
  const heldTools = await toolNames(page);

  await page.getByRole("button", { name: "RESUME GIORNATA" }).click();
  await waitForTools(page, initialTools);
  const resumedTools = await toolNames(page);

  const beforeClaim = await executeTool(page, "inspect_workshop", { view: "summary" });
  const claimReceipt = await executeTool(page, "return_work_result", {
    summary: "Registered and verified the bounded WebMCP workshop tools.",
    verification: "Deterministic tests and a native Chrome journey passed.",
    evidenceRef: "docs/WEBMCP_POC.md",
    remainingRisk: "Natural-language agent selection is not yet verified.",
    expectedStateVersion: beforeClaim.stateVersion,
    idempotencyKey: "browser-result-1",
  });
  await waitForTools(page, ["inspect_workshop"]);
  await page.getByRole("button", { name: "VERIFY CLAIM" }).waitFor();
  const claimedManca = await page.locator(".topbar-status > span").nth(1).innerText();
  await page.screenshot({
    path: "/private/tmp/verrocchio-webmcp-desktop-claim.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: "VERIFY CLAIM" }).click();
  await waitForTools(page, initialTools);
  const verifiedManca = await page.locator(".topbar-status > span").nth(1).innerText();
  await page.screenshot({
    path: "/private/tmp/verrocchio-webmcp-desktop-verified.png",
    fullPage: true,
  });

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.evaluate(() => {
    const key = "verrocchio-workshop-v2";
    const workshop = JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify({ ...workshop, activeView: "contratto" }));
  });
  await mobile.reload({ waitUntil: "networkidle" });
  await mobile.screenshot({
    path: "/private/tmp/verrocchio-webmcp-mobile.png",
    fullPage: true,
  });
  const mobileOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  const mobileOverflowingElements = await mobile.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll("body *")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: String(element.className || "").slice(0, 80),
          text: String(element.textContent || "").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.left < -1 || item.right > width + 1)
      .slice(0, 12);
  });
  await mobile.close();

  process.stdout.write(
    `${JSON.stringify(
      {
        initialTools,
        beforeFermo,
        fermoReceipt,
        heldTools,
        resumedTools,
        beforeClaim,
        claimReceipt,
        claimedManca,
        verifiedManca,
        finalTools: await toolNames(page),
        mobileOverflow,
        mobileOverflowingElements,
        notFound,
        errors,
        warnings,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await browser.close();
}
