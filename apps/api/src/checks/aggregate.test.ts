import { describe, expect, it } from "vitest";
import { aggregateStatus } from "./aggregate";
import type { SepCheckOutcome } from "./types";

function outcome(sepType: SepCheckOutcome["sepType"], passed: boolean): SepCheckOutcome {
  return { sepType, passed, latencyMs: 100, errorDetail: passed ? null : "boom", rawResponse: null };
}

describe("aggregateStatus", () => {
  it("returns down when there are no results", () => {
    expect(aggregateStatus([])).toBe("down");
  });

  it("returns down when sep1 fails, regardless of other results", () => {
    const outcomes = [outcome("sep1", false), outcome("sep10", true)];
    expect(aggregateStatus(outcomes)).toBe("down");
  });

  it("returns operational when every declared SEP passes", () => {
    const outcomes = [outcome("sep1", true), outcome("sep10", true), outcome("sep24", true)];
    expect(aggregateStatus(outcomes)).toBe("operational");
  });

  it("returns down when sep1 passes but every other declared SEP fails", () => {
    const outcomes = [outcome("sep1", true), outcome("sep6", false), outcome("sep24", false)];
    expect(aggregateStatus(outcomes)).toBe("down");
  });

  it("returns degraded on a mix of passing and failing declared SEPs", () => {
    const outcomes = [outcome("sep1", true), outcome("sep6", true), outcome("sep24", false)];
    expect(aggregateStatus(outcomes)).toBe("degraded");
  });

  it("returns operational for an anchor that only declares sep1 and it passes", () => {
    expect(aggregateStatus([outcome("sep1", true)])).toBe("operational");
  });
});
