import { RandomGenerator } from "../../../infrastructure/random";

import { Match } from "../Match";
import { Toss } from "./Toss";
import { TossDecision } from "./TossDecision";

export class TossGenerator {
  public constructor(private readonly random: RandomGenerator) {}

  public generate(match: Match): Toss {
    const winner = this.random.pick([match.getTeamA(), match.getTeamB()]);

    const decision = this.random.pick([TossDecision.BAT, TossDecision.BOWL]);

    return new Toss(winner, decision);
  }
}
