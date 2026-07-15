import { InningsPhase } from "./InningsPhase";

export class InningsPhases {
  public constructor(
    private readonly powerplayOvers: number,
    private readonly deathOversStart: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.powerplayOvers < 0) {
      throw new Error("Powerplay overs cannot be negative.");
    }

    if (this.deathOversStart <= this.powerplayOvers) {
      throw new Error("Death overs must begin after the powerplay.");
    }
  }

  public getPowerplayOvers(): number {
    return this.powerplayOvers;
  }

  public getDeathOversStart(): number {
    return this.deathOversStart;
  }

  public phaseAt(completedOvers: number): InningsPhase {
    if (completedOvers < this.powerplayOvers) {
      return InningsPhase.POWERPLAY;
    }

    if (completedOvers < this.deathOversStart) {
      return InningsPhase.MIDDLE_OVERS;
    }

    return InningsPhase.DEATH_OVERS;
  }
}
