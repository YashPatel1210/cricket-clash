import { Team } from "../team";
import { CountrySelectionStrategy } from "./CountrySelectionStrategy";
import { DraftContext } from "./DraftContext";
import { RoleEligibilityStrategy } from "./RoleEligibilityStrategy";

export class DraftGenerator {
  public constructor(
    private readonly countryStrategy: CountrySelectionStrategy,
    private readonly roleStrategy: RoleEligibilityStrategy,
  ) {}

  public generate(context: DraftContext): Team {
    const team = context.getTeam();

    while (!team.isComplete()) {
      this.generateNextPlayer(context, team);
    }

    return team;
  }

  private generateNextPlayer(context: DraftContext, team: Team): void {
    const country = this.countryStrategy.select(context);

    const availableRoles = this.roleStrategy.availableRoles(context);

    const role = context.getRandom().pick(availableRoles);

    const candidates = context
      .getPlayerPool()
      .availablePlayers(country, role, team.selectedPlayerIds());

    if (candidates.length === 0) {
      throw new Error(`No ${role} available for ${country}.`);
    }

    const player = context.getRandom().pick(candidates);

    const result = team.addPlayer(player);

    if (!result.success) {
      throw new Error(result.message);
    }
  }
}
