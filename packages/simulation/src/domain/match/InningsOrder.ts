import { Team } from "../team";

export class InningsOrder {
  public constructor(
    private readonly battingTeam: Team,
    private readonly bowlingTeam: Team,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.battingTeam === this.bowlingTeam) {
      throw new Error("Batting and bowling teams must be different.");
    }
  }

  public getBattingTeam(): Team {
    return this.battingTeam;
  }

  public getBowlingTeam(): Team {
    return this.bowlingTeam;
  }
}
