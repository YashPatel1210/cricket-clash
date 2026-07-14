import { ValidationResult } from "./ValidationResult";
export class ValidationSummary {
  public constructor(private readonly results: readonly ValidationResult[]) {}

  public getResults(): readonly ValidationResult[] {
    return this.results;
  }

  public passed(): boolean {
    return this.results.every((result) => result.isPassing());
  }

  public failedCount(): number {
    return this.results.filter((result) => !result.isPassing()).length;
  }

  public passedCount(): number {
    return this.results.filter((result) => result.isPassing()).length;
  }
}
