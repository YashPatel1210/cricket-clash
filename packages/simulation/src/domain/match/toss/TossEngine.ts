import { RandomGenerator } from "../../../infrastructure/random";

import { Match } from "../Match";

import { Toss } from "./Toss";
import { TossDecision } from "./TossDecision";

export class TossEngine {
  public constructor(private readonly random: RandomGenerator) {}

  public conduct(match: Match): Toss {
    const winner =
      this.random.nextInt(0, 1) === 0 ? match.getTeamA() : match.getTeamB();

    const decision =
      this.random.nextInt(0, 1) === 0 ? TossDecision.BAT : TossDecision.BOWL;

    return new Toss(winner, decision);
  }
}
