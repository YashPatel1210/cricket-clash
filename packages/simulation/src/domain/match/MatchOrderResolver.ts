import { Team } from "../team";

import { InningsOrder } from "./InningsOrder";
import { Match } from "./Match";
import { MatchOrder } from "./MatchOrder";

import { Toss } from "./toss/Toss";

export class MatchOrderResolver {
  public resolve(match: Match, toss: Toss): MatchOrder {
    const winner = toss.getWinner();

    const opponent = this.opponent(match, winner);

    if (toss.electedToBat()) {
      return new MatchOrder(
        new InningsOrder(winner, opponent),
        new InningsOrder(opponent, winner),
      );
    }

    return new MatchOrder(
      new InningsOrder(opponent, winner),
      new InningsOrder(winner, opponent),
    );
  }

  private opponent(match: Match, team: Team): Team {
    return match.getTeamA() === team ? match.getTeamB() : match.getTeamA();
  }
}
