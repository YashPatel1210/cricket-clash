import { STANDARD_T20_TEAM_RULES } from "../../domain/rules";
import { Team, TeamSelection } from "../../domain/team";

export class TeamBuilder {
  private readonly team = new Team(STANDARD_T20_TEAM_RULES);

  private constructor() {}

  public static standard(): TeamBuilder {
    return new TeamBuilder();
  }

  public withPlayer(
    selection: TeamSelection,
  ): TeamBuilder {
    const result = this.team.addSelection(selection);

    if (!result.success) {
      throw new Error(result.message);
    }

    return this;
  }

  public build(): Team {
    return this.team;
  }
}