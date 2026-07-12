import { Score } from "../score";

export class Target {
  public constructor(private readonly targetScore: number) {
    this.validate();
  }

  private validate(): void {
    if (this.targetScore < 1) {
      throw new Error("Target score must be greater than zero.");
    }
  }

  public score(): number {
    return this.targetScore;
  }

  public isReached(score: Score): boolean {
    return score.getRuns() >= this.targetScore;
  }
}
