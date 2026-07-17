import { Team } from "../../team";

import { Score } from "../score";
import { InningsStatistics } from "../statistics/InningsStatistics";
import { Partnership } from "../context/Partnership";

import { BattingOrder } from "./BattingOrder";
import { BattingPair } from "./BattingPair";
import { BowlingAttack } from "./BowlingAttack";
import { BowlingSpell } from "./BowlingSpell";
import { InningsState } from "./InningsState";

export class Innings {
  public constructor(
    private readonly battingTeam: Team,
    private readonly bowlingTeam: Team,
    private readonly score: Score,
    private readonly battingPair: BattingPair,
    private readonly bowlingAttack: BowlingAttack,
    private readonly battingOrder: BattingOrder,
    private readonly state: InningsState = InningsState.NOT_STARTED,
    private readonly statistics: InningsStatistics = InningsStatistics.empty(),
    private readonly partnership: Partnership = Partnership.empty(),
    /** Runs scored in the last completed over. Updated by OverEngine. */
    private readonly lastOverRuns: number = 0,
    /**
     * Legal balls since the last wicket fell.
     * 0 = wicket just fell, 999 = no wicket yet this innings.
     * Used for wicket-clustering modifier.
     */
    private readonly ballsSinceLastWicket: number = 999,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.battingTeam === this.bowlingTeam) {
      throw new Error("An innings requires two different teams.");
    }
  }

  public getBattingTeam(): Team { return this.battingTeam; }
  public getBowlingTeam(): Team { return this.bowlingTeam; }
  public getScore(): Score { return this.score; }
  public getBattingPair(): BattingPair { return this.battingPair; }

  /** Returns the current bowler's spell (current over stats only). */
  public getBowlingSpell(): BowlingSpell {
    return this.bowlingAttack.getCurrentSpell();
  }

  /** Returns the full bowling attack (spell + rotation + quota ledger). */
  public getBowlingAttack(): BowlingAttack { return this.bowlingAttack; }
  public getBattingOrder(): BattingOrder { return this.battingOrder; }
  public getState(): InningsState { return this.state; }
  public getStatistics(): InningsStatistics { return this.statistics; }
  public getPartnership(): Partnership { return this.partnership; }
  public getLastOverRuns(): number { return this.lastOverRuns; }
  public getBallsSinceLastWicket(): number { return this.ballsSinceLastWicket; }

  public hasStarted(): boolean { return this.state !== InningsState.NOT_STARTED; }
  public isCompleted(): boolean { return this.state === InningsState.COMPLETED; }

  // ── Immutable state transitions ──────────────────────────────────────

  public start(): Innings { return this.with({ state: InningsState.IN_PROGRESS }); }
  public complete(): Innings { return this.with({ state: InningsState.COMPLETED }); }
  public withScore(score: Score): Innings { return this.with({ score }); }
  public withBattingPair(battingPair: BattingPair): Innings { return this.with({ battingPair }); }
  public withBowlingAttack(bowlingAttack: BowlingAttack): Innings { return this.with({ bowlingAttack }); }
  public withBattingOrder(battingOrder: BattingOrder): Innings { return this.with({ battingOrder }); }
  public withStatistics(statistics: InningsStatistics): Innings { return this.with({ statistics }); }
  public withPartnership(partnership: Partnership): Innings { return this.with({ partnership }); }
  public withLastOverRuns(lastOverRuns: number): Innings { return this.with({ lastOverRuns }); }
  public withBallsSinceLastWicket(ballsSinceLastWicket: number): Innings { return this.with({ ballsSinceLastWicket }); }

  private with(overrides: {
    score?: Score;
    battingPair?: BattingPair;
    bowlingAttack?: BowlingAttack;
    battingOrder?: BattingOrder;
    state?: InningsState;
    statistics?: InningsStatistics;
    partnership?: Partnership;
    lastOverRuns?: number;
    ballsSinceLastWicket?: number;
  }): Innings {
    return new Innings(
      this.battingTeam,
      this.bowlingTeam,
      overrides.score          ?? this.score,
      overrides.battingPair    ?? this.battingPair,
      overrides.bowlingAttack  ?? this.bowlingAttack,
      overrides.battingOrder   ?? this.battingOrder,
      overrides.state          ?? this.state,
      overrides.statistics     ?? this.statistics,
      overrides.partnership    ?? this.partnership,
      overrides.lastOverRuns   ?? this.lastOverRuns,
      overrides.ballsSinceLastWicket ?? this.ballsSinceLastWicket,
    );
  }
}
