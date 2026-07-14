import { describe, expect, it } from "vitest";

import { ExpectedRange } from "./ExpectedRange";

describe("ExpectedRange", () => {
  it("should expose minimum and maximum values", () => {
    const range = new ExpectedRange(150, 180);

    expect(range.getMinimum()).toBe(150);
    expect(range.getMaximum()).toBe(180);
  });

  it("should contain values inside the range", () => {
    const range = new ExpectedRange(150, 180);

    expect(range.contains(150)).toBe(true);
    expect(range.contains(165)).toBe(true);
    expect(range.contains(180)).toBe(true);
  });

  it("should reject values outside the range", () => {
    const range = new ExpectedRange(150, 180);

    expect(range.contains(149)).toBe(false);
    expect(range.contains(181)).toBe(false);
  });

  it("should throw when minimum is greater than maximum", () => {
    expect(() => {
      new ExpectedRange(180, 150);
    }).toThrow("Minimum value cannot be greater than maximum value.");
  });
});
