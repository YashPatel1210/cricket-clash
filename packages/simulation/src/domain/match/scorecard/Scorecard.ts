import { Team } from "../../team";
import { InningsResult } from "../innings/InningsResult";
import { InningsStatistics } from "../statistics/InningsStatistics";
import { Toss } from "../toss/Toss";

/**
 * Complete match scorecard produced after every simulation.
 *
 * Contains all the information needed for match analysis,
 * UI display, and post-match statistics.
 */
export class Scorecard {
  public constructor(
    private readonly toss: Toss | undefined,
    private readonly firstInningsResult: InningsResult,
    private readonly secondInningsResult: InningsResult,
    private readonly firstInningsStats: InningsStatistics,
    private readonly secondInningsStats: InningsStatistics,
    private readonly winner: Team | undefined,
  ) {}

  public getToss(): Toss | undefined {
    return this.toss;
  }

  public getFirstInningsResult(): InningsResult {
    return this.firstInningsResult;
  }

  public getSecondInningsResult(): InningsResult {
    return this.secondInningsResult;
  }

  public getFirstInningsStats(): InningsStatistics {
    return this.firstInningsStats;
  }

  public getSecondInningsStats(): InningsStatistics {
    return this.secondInningsStats;
  }

  public getWinner(): Team | undefined {
    return this.winner;
  }

  public isTie(): boolean {
    return this.winner === undefined;
  }

  public getWinningTeamName(): string {
    if (!this.winner) return "Tie";
    // Teams don't have names in the current model — return "Winner" as placeholder
    return "Winner";
  }

  public getFirstInningsScore(): string {
    const score = this.firstInningsResult.getInnings().getScore();
    return `${score.getRuns()}/${score.getWickets()} (${score.getOvers()})`;
  }

  public getSecondInningsScore(): string {
    const score = this.secondInningsResult.getInnings().getScore();
    return `${score.getRuns()}/${score.getWickets()} (${score.getOvers()})`;
  }
}
