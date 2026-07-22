import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { DraftPickStatus } from "./DraftPickStatus";
import { DraftSquad } from "./DraftSquad";

export class DraftPickOption {
  public constructor(
    public readonly player: Player,
    public readonly status: DraftPickStatus,
    public readonly eligiblePositions: ReadonlyArray<BattingPosition>,
  ) {}

  public isSelectable(): boolean {
    return this.status === DraftPickStatus.AVAILABLE && this.eligiblePositions.length > 0;
  }
}

/**
 * Builds DraftPickOptions for a round's players from one participant's perspective.
 *
 * Enforces:
 *   1. Already picked → ALREADY_PICKED
 *   2. Squad full → SQUAD_FULL
 *   3. Role max reached → ROLE_LIMIT_REACHED
 *   4. No valid position → NO_ELIGIBLE_POSITION
 *   5. Minimum not met with few picks left → MUST_FILL_MINIMUM
 *      (forces user to pick required roles only)
 */
export function buildPickOptions(
  players: ReadonlyArray<Player>,
  squad: DraftSquad,
): ReadonlyArray<DraftPickOption> {
  const rules         = squad.getRules();
  const remaining     = rules.squadSize - squad.size();
  const requiredRoles = squad.requiredRoles();
  const totalRequired = squad.totalRequiredPicks();

  // If remaining picks == required picks, force user to only pick required roles
  const forceRequiredOnly = totalRequired > 0 && remaining <= totalRequired;

  return players.map((player) => {
    const role = player.role as string;

    if (squad.hasPlayer(player.id)) {
      return new DraftPickOption(player, DraftPickStatus.ALREADY_PICKED, []);
    }

    if (squad.isFull()) {
      return new DraftPickOption(player, DraftPickStatus.SQUAD_FULL, []);
    }

    // Forced minimum: must pick required roles before anything else
    if (forceRequiredOnly && !requiredRoles.includes(role)) {
      return new DraftPickOption(player, DraftPickStatus.MUST_FILL_MINIMUM, []);
    }

    const roleLimit = rules.limits[role];
    if (!roleLimit) {
      // Unknown role — allow but check positions
      const eligible = squad.eligiblePositionsFor(player);
      if (eligible.length === 0) {
        return new DraftPickOption(player, DraftPickStatus.NO_ELIGIBLE_POSITION, []);
      }
      return new DraftPickOption(player, DraftPickStatus.AVAILABLE, eligible);
    }

    if (squad.roleCount(role as never) >= roleLimit.max) {
      return new DraftPickOption(player, DraftPickStatus.ROLE_LIMIT_REACHED, []);
    }

    const eligible = squad.eligiblePositionsFor(player);
    if (eligible.length === 0) {
      return new DraftPickOption(player, DraftPickStatus.NO_ELIGIBLE_POSITION, []);
    }

    return new DraftPickOption(player, DraftPickStatus.AVAILABLE, eligible);
  });
}
