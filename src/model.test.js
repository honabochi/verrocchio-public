import { expect, test } from "vitest";
import { exportWorkshop, initialState, remainingTime } from "./model.js";

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
