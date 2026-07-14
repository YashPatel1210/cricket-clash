import { ValidationSummary } from "./ValidationSummary";

export class ValidationFormatter {
  public format(summary: ValidationSummary): string {
    const lines: string[] = [];

    lines.push("==========================================");
    lines.push("Cricket Clash Validation");
    lines.push("==========================================");
    lines.push("");

    for (const result of summary.getResults()) {
      const status = result.isPassing() ? "PASS" : "FAIL";

      lines.push(result.getMetric());
      lines.push(`Actual   : ${result.getActual().toFixed(2)}`);
      lines.push(
        `Expected : ${result.getExpected().getMinimum().toFixed(2)} - ${result
          .getExpected()
          .getMaximum()
          .toFixed(2)}`,
      );
      lines.push(`Result   : ${status}`);
      lines.push("");
    }

    lines.push("==========================================");
    lines.push(`Passed : ${summary.passedCount()}`);
    lines.push(`Failed : ${summary.failedCount()}`);
    lines.push(`Status : ${summary.passed() ? "PASS" : "FAIL"}`);
    lines.push("==========================================");

    return lines.join("\n");
  }
}
