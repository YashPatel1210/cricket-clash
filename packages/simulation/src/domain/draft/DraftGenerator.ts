import { Team } from "../team";
import { CountrySelectionStrategy } from "./CountrySelectionStrategy";
import { DraftContext } from "./DraftContext";
import { RoleEligibilityStrategy } from "./RoleEligibilityStrategy";

export class DraftGenerator {
  public constructor(private readonly roleStrategy: RoleEligibilityStrategy) {}

  public generate(context: DraftContext): Team {
    const team = context.getTeam();

    while (!team.isComplete()) {
      this.generateNextPlayer(context, team);
    }

    return team;
  }

  private generateNextPlayer(context: DraftContext, team: Team): void {
    const roles = this.roleStrategy.availableRoles(context);

    const candidates = context
      .getPlayerPool()
      .availablePlayers(roles, team.selectedPlayerIds());

    if (candidates.length === 0) {
      throw new Error("No eligible players available.");
    }

    const player = context.getRandom().pick(candidates);

    const result = team.addPlayer(player);

    if (!result.success) {
      throw new Error(result.message);
    }
  }
}
