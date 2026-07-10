import { Team } from "../team";
import { DraftStatus } from "./DraftStatus";

export class Draft {
  constructor(
    public readonly id: string,

    public readonly seed: number,

    private readonly team: Team,

    private currentRound: number = 1,

    private remainingPicks: number = 12,

    private status: DraftStatus = DraftStatus.IN_PROGRESS,
  ) {}

  public getCurrentRound(): number {
    return this.currentRound;
  }

  public getRemainingPicks(): number {
    return this.remainingPicks;
  }

  public getStatus(): DraftStatus {
    return this.status;
  }

  public getTeam(): Team {
    return this.team;
  }
}