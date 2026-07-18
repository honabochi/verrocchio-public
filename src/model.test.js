import test from "node:test";
import assert from "node:assert/strict";
import { exportWorkshop, initialState, remainingTime } from "./model.js";

test("remainingTime converts the official deadline into a stable countdown", () => {
  const value = remainingTime(
    "2026-07-22T09:00:00+09:00",
    new Date("2026-07-18T09:00:00+09:00"),
  );

  assert.deepEqual(value, { days: 4, hours: 0, minutes: 0 });
});

test("exportWorkshop derives MANCA from incomplete gates", () => {
  const exported = JSON.parse(exportWorkshop(initialState));
  assert.equal(exported.manca, 6);
  assert.equal(exported.schema, "verrocchio.workshop.v1");
});
