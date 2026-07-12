import { Team } from "../../team";
import { Score } from "../score";
import { BattingPair } from "./BattingPair";
import { BowlingSpell } from "./BowlingSpell";
import { InningsState } from "./InningsState";

export class Innings {
  private state: InningsState = InningsState.NOT_STARTED;

  public constructor(
    private readonly battingTeam: Team,
    private readonly bowlingTeam: Team,
    private readonly score: Score,
    private readonly battingPair: BattingPair,
    private readonly bowlingSpell: BowlingSpell,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.battingTeam === this.bowlingTeam) {
      throw new Error("An innings requires two different teams.");
    }
  }

  public getBattingTeam(): Team {
    return this.battingTeam;
  }

  public getBowlingTeam(): Team {
    return this.bowlingTeam;
  }

  public getState(): InningsState {
    return this.state;
  }

  public hasStarted(): boolean {
    return this.state !== InningsState.NOT_STARTED;
  }

  public isCompleted(): boolean {
    return this.state === InningsState.COMPLETED;
  }
  public getScore(): Score {
    return this.score;
  }

  public getBattingPair(): BattingPair {
    return this.battingPair;
  }

  public getBowlingSpell(): BowlingSpell {
    return this.bowlingSpell;
  }
}
