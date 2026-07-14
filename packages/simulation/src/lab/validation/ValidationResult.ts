import { ExpectedRange } from "./ExpectedRange";

export class ValidationResult {
  public constructor(
    private readonly metric: string,
    private readonly actual: number,
    private readonly expected: ExpectedRange,
  ) {}

  public getMetric(): string {
    return this.metric;
  }

  public getActual(): number {
    return this.actual;
  }

  public getExpected(): ExpectedRange {
    return this.expected;
  }

  public isPassing(): boolean {
    return this.expected.contains(this.actual);
  }
}
