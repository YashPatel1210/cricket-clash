import { InningsPhases } from "./InningsPhases";

export class MatchRules {
  public constructor(
    private readonly maximumOvers: number,
    private readonly ballsPerOver: number = 6,
    private readonly inningsPhases: InningsPhases,
  ) {}

  public getMaximumOvers(): number {
    return this.maximumOvers;
  }

  public getBallsPerOver(): number {
    return this.ballsPerOver;
  }

  public getMaximumBalls(): number {
    return this.maximumOvers * this.ballsPerOver;
  }

  public getInningsPhases(): InningsPhases {
    return this.inningsPhases;
  }
}
