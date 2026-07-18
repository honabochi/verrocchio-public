import { expect, test } from "vitest";
import {
  buildWorkPacket,
  exportWorkshop,
  initialState,
  loadWorkshop,
  remainingTime,
  STORAGE_KEY,
} from "./model.js";

test("remainingTime converts the official deadline into a stable countdown", () => {
  const value = remainingTime(
    "2026-07-22T09:00:00+09:00",
    new Date("2026-07-18T09:00:00+09:00"),
  );

  expect(value).toEqual({ days: 4, hours: 0, minutes: 0 });
});

test("exportWorkshop derives MANCA from incomplete gates", () => {
  const exported = JSON.parse(exportWorkshop(initialState));
  expect(exported.manca).toBe(6);
  expect(exported.schema).toBe("verrocchio.workshop.v1");
});

test("buildWorkPacket compiles the contract, next gate, duty, and stop rule", () => {
  const packet = buildWorkPacket(initialState, "prima-mano");

  expect(packet).toContain("CARTONE PACKET · LA PRIMA MANO");
  expect(packet).toContain("Working product");
  expect(packet).toContain("Implement the smallest verified change");
  expect(packet).toContain("Stop before publishing");
});

test("loadWorkshop migrates an old held AFFRESCO into a pending FIRMA", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      isHeld: true,
      capobottega: {
        latest: {
          humanAction: "FIRMA_REQUIRED",
          responseId: "resp_old_affresco",
          nextStroke: "Publish the build.",
          reason: "Publishing changes external state.",
        },
      },
    }),
  );

  expect(loadWorkshop().firmaPending).toEqual({
    responseId: "resp_old_affresco",
    title: "Publish the build.",
    reason: "Publishing changes external state.",
  });
});
