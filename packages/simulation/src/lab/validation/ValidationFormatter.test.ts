import { describe, expect, it } from "vitest";

import { ExpectedRange } from "./ExpectedRange";
import { ValidationFormatter } from "./ValidationFormatter";
import { ValidationResult } from "./ValidationResult";
import { ValidationSummary } from "./ValidationSummary";

describe("ValidationFormatter", () => {
  it("should format a validation summary", () => {
    const summary = new ValidationSummary([
      new ValidationResult("Average Runs", 167, new ExpectedRange(150, 180)),
    ]);

    const formatter = new ValidationFormatter();

    const output = formatter.format(summary);

    expect(output).toContain("Average Runs");

    expect(output).toContain("PASS");

    expect(output).toContain("Passed : 1");
  });
});
