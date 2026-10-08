import test from "node:test";
import assert from "node:assert/strict";
import { todayInSaoPaulo, validPastDate } from "../../src/shared/calendar";

test("a virada do dia respeita São Paulo e não a data UTC do servidor", () => {
  const beforeMidnight = new Date("2026-10-08T02:59:59Z");
  assert.equal(todayInSaoPaulo(beforeMidnight), "2026-10-07");
  assert.equal(validPastDate("2026-10-08", beforeMidnight), false);
  const midnight = new Date("2026-10-08T03:00:00Z");
  assert.equal(todayInSaoPaulo(midnight), "2026-10-08");
  assert.equal(validPastDate("2026-10-08", midnight), true);
});

test("datas inválidas, normalizadas pelo JavaScript e futuras são recusadas", () => {
  const now = new Date("2026-10-07T15:00:00Z");
  assert.equal(validPastDate("2024-02-29", now), true);
  for (const value of [
    "2026-02-29",
    "0000-01-01",
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-10-08",
    "07/10/2026",
  ]) {
    assert.equal(validPastDate(value, now), false, value);
  }
});
