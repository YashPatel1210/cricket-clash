import { PlayerRole } from "@cricket-clash/shared";

import { DraftContext } from "./DraftContext";
import { RoleEligibilityStrategy } from "./RoleEligibilityStrategy";

export class DefaultRoleEligibilityStrategy implements RoleEligibilityStrategy {
  public availableRoles(context: DraftContext): ReadonlyArray<PlayerRole> {
    const team = context.getTeam();

    const belowMinimum: PlayerRole[] = [];
    const belowMaximum: PlayerRole[] = [];

    const roles = [
      PlayerRole.BATTER,
      PlayerRole.ALL_ROUNDER,
      PlayerRole.BOWLER,
      PlayerRole.WICKET_KEEPER,
    ];

    for (const role of roles) {
      const current = team.roleCount(role);

      if (current < team.minimumRoleCount(role)) {
        belowMinimum.push(role);
      }

      if (current < team.maximumRoleCount(role)) {
        belowMaximum.push(role);
      }
    }

    if (belowMinimum.length > 0) {
      return belowMinimum;
    }

    return belowMaximum;
  }
}
