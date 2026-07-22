import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { DraftPickStatus } from "./DraftPickStatus";
import { DraftSquad } from "./DraftSquad";

/**
 * A single player-option in a draft round as seen by one participant.
 *
 * Carries the player, their eligible positions (where they CAN be placed),
 * and why they may or may not be selectable.
 */
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
 */
export function buildPickOptions(
  players: ReadonlyArray<Player>,
  squad: DraftSquad,
): ReadonlyArray<DraftPickOption> {
  return players.map((player) => {
    // Already in this squad?
    if (squad.hasPlayer(player.id)) {
      return new DraftPickOption(player, DraftPickStatus.ALREADY_PICKED, []);
    }

    // Squad already full?
    if (squad.isFull()) {
      return new DraftPickOption(player, DraftPickStatus.SQUAD_FULL, []);
    }

    // Role limit reached?
    const rules      = squad.getRules();
    const roleCount  = squad.roleCount(player.role);
    const roleLimit  = rules.limits[player.role];

    // Guard: if role isn't in the limits definition, treat as available
    if (!roleLimit) {
      console.warn(`[DraftPickOption] Unknown role: "${player.role}" for player ${player.name}`);
      const eligible = squad.eligiblePositionsFor(player);
      if (eligible.length === 0) {
        return new DraftPickOption(player, DraftPickStatus.NO_ELIGIBLE_POSITION, []);
      }
      return new DraftPickOption(player, DraftPickStatus.AVAILABLE, eligible);
    }

    if (roleCount >= roleLimit.max) {
      return new DraftPickOption(player, DraftPickStatus.ROLE_LIMIT_REACHED, []);
    }

    // Which positions can we actually place them?
    const eligible = squad.eligiblePositionsFor(player);
    if (eligible.length === 0) {
      return new DraftPickOption(player, DraftPickStatus.NO_ELIGIBLE_POSITION, []);
    }

    return new DraftPickOption(player, DraftPickStatus.AVAILABLE, eligible);
  });
}
