import { describe, expect, it } from "vitest";

import { ExpectedRange } from "./ExpectedRange";
import { ValidationResult } from "./ValidationResult";

describe("ValidationResult", () => {
  it("should expose metric information", () => {
    const result = new ValidationResult(
      "Average Runs",
      167,
      new ExpectedRange(150, 180),
    );

    expect(result.getMetric()).toBe("Average Runs");

    expect(result.getActual()).toBe(167);

    expect(result.getExpected().getMinimum()).toBe(150);

    expect(result.getExpected().getMaximum()).toBe(180);
  });

  it("should pass when actual value is inside the expected range", () => {
    const result = new ValidationResult(
      "Average Runs",
      167,
      new ExpectedRange(150, 180),
    );

    expect(result.isPassing()).toBe(true);
  });

  it("should fail when actual value is outside the expected range", () => {
    const result = new ValidationResult(
      "Average Runs",
      190,
      new ExpectedRange(150, 180),
    );

    expect(result.isPassing()).toBe(false);
  });
});
