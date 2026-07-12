import { Team } from "../team";

import { TossDecision } from "./TossDecision";

export class Toss {
  public constructor(
    private readonly winner: Team,
    private readonly decision: TossDecision,
  ) {}

  public getWinner(): Team {
    return this.winner;
  }

  public getDecision(): TossDecision {
    return this.decision;
  }

  public electedToBat(): boolean {
    return this.decision === TossDecision.BAT;
  }

  public electedToBowl(): boolean {
    return this.decision === TossDecision.BOWL;
  }
}
