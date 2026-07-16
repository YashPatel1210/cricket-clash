import { InningsPhases } from "./InningsPhases";

export class MatchRules {
  public constructor(
    private readonly maximumOvers: number,
    private readonly ballsPerOver: number = 6,
    private readonly inningsPhases: InningsPhases = new InningsPhases(
      Math.floor(maximumOvers * 0.3),
      Math.ceil(maximumOvers * 0.8),
    ),
    private readonly maxOversPerBowler: number = Math.floor(maximumOvers / 5),
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

  public getMaxBallsPerBowler(): number {
    return this.maxOversPerBowler * this.ballsPerOver;
  }

  public getMaxOversPerBowler(): number {
    return this.maxOversPerBowler;
  }

  public getInningsPhases(): InningsPhases {
    return this.inningsPhases;
  }
}
