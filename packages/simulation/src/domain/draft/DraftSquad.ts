import { PlayerRole } from "@cricket-clash/shared";

import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { PositionRange } from "./PositionRange";
import { SquadCompositionRules, T20_SQUAD_RULES } from "./SquadCompositionRules";

export type PickFailureReason =
  | "SQUAD_FULL"
  | "POSITION_OCCUPIED"
  | "POSITION_OUT_OF_RANGE"
  | "ROLE_LIMIT_REACHED"
  | "PLAYER_ALREADY_IN_SQUAD"
  /** Picking here would leave no valid positions for a still-required role. */
  | "WOULD_BLOCK_REQUIRED_ROLE";

export interface PickValidation {
  valid: boolean;
  reason?: PickFailureReason;
}

/**
 * DraftSquad — one player's building squad during the draft.
 *
 * Enforces:
 *   - Exactly one player per batting position (1–11)
 *   - Role-position ranges (Bowlers can't bat at #1)
 *   - Squad composition limits (min/max per role)
 *   - No duplicate players
 *   - Position lockout: cannot close off all valid positions for a required role
 *
 * Immutable — every mutation returns a new DraftSquad.
 */
export class DraftSquad {
  private constructor(
    private readonly slots: ReadonlyMap<number, Player>,
    private readonly rules: SquadCompositionRules,
  ) {}

  public static empty(rules: SquadCompositionRules = T20_SQUAD_RULES): DraftSquad {
    return new DraftSquad(new Map(), rules);
  }

  // ── Queries ────────────────────────────────────────────────────────────

  public size(): number { return this.slots.size; }
  public isComplete(): boolean { return this.slots.size === this.rules.squadSize; }
  public isFull(): boolean { return this.slots.size >= this.rules.squadSize; }

  public getPlayerAt(position: BattingPosition): Player | undefined {
    return this.slots.get(position.getValue());
  }

  public hasPlayer(playerId: string): boolean {
    return Array.from(this.slots.values()).some((p) => p.id === playerId);
  }

  public getAllPicks(): ReadonlyArray<{ position: BattingPosition; player: Player }> {
    return Array.from(this.slots.entries())
      .sort(([a], [b]) => a - b)
      .map(([pos, player]) => ({ position: BattingPosition.of(pos), player }));
  }

  public roleCount(role: PlayerRole | string): number {
    const roleStr = role as string;
    return Array.from(this.slots.values()).filter((p) => (p.role as string) === roleStr).length;
  }

  public getRules(): SquadCompositionRules { return this.rules; }

  public eligiblePositionsFor(player: Player): ReadonlyArray<BattingPosition> {
    const range = PositionRange.RANGES[player.role as string];
    if (!range) return [];

    const roleLimit = this.rules.limits[player.role as string];
    const roleMax   = roleLimit?.max ?? 99;

    return range.eligiblePositions().filter((pos) => {
      if (this.slots.has(pos.getValue())) return false;
      if (this.roleCount(player.role) >= roleMax) return false;
      if (this.isFull()) return false;
      return true;
    });
  }

  // ── Validation ──────────────────────────────────────────────────────────

  public canPick(player: Player, position: BattingPosition): PickValidation {
    if (this.isFull()) {
      return { valid: false, reason: "SQUAD_FULL" };
    }
    if (this.hasPlayer(player.id)) {
      return { valid: false, reason: "PLAYER_ALREADY_IN_SQUAD" };
    }
    if (this.slots.has(position.getValue())) {
      return { valid: false, reason: "POSITION_OCCUPIED" };
    }

    const range = PositionRange.RANGES[player.role as string];
    if (range && !range.includes(position)) {
      return { valid: false, reason: "POSITION_OUT_OF_RANGE" };
    }

    const roleLimit   = this.rules.limits[player.role as string];
    const roleCurrent = this.roleCount(player.role);
    if (roleLimit && roleCurrent >= roleLimit.max) {
      return { valid: false, reason: "ROLE_LIMIT_REACHED" };
    }

    // ── Position lockout check ──────────────────────────────────────────
    // After placing this player, would any still-required role lose ALL valid positions?
    const lockout = this.wouldBlockRequiredRole(player, position);
    if (lockout) {
      return { valid: false, reason: "WOULD_BLOCK_REQUIRED_ROLE" };
    }

    return { valid: true };
  }

  /**
   * Returns true if placing `player` at `position` would leave zero open positions
   * for any role that still needs at least one more player (below minimum).
   */
  private wouldBlockRequiredRole(player: Player, position: BattingPosition): boolean {
    const requiredRoles = this.requiredRoles();
    if (requiredRoles.length === 0) return false;

    // Simulate adding this player
    const newSlots = new Map(this.slots);
    newSlots.set(position.getValue(), player);

    for (const reqRole of requiredRoles) {
      // If this pick itself fills the required role, no lockout
      if ((player.role as string) === reqRole) continue;

      // Count still-needed for this required role after pick
      const currentCount = this.roleCount(reqRole);
      const limit        = this.rules.limits[reqRole];
      const stillNeeded  = limit ? Math.max(0, limit.min - currentCount) : 0;
      if (stillNeeded <= 0) continue;

      // How many valid positions remain for reqRole after the pick?
      const roleRange = PositionRange.RANGES[reqRole];
      if (!roleRange) continue;

      const openAfterPick = roleRange
        .eligiblePositions()
        .filter((p) => !newSlots.has(p.getValue()))
        .length;

      if (openAfterPick < stillNeeded) {
        return true; // would lock out this required role
      }
    }

    return false;
  }

  // ── Mutation ────────────────────────────────────────────────────────────

  public pick(player: Player, position: BattingPosition): DraftSquad {
    const validation = this.canPick(player, position);
    if (!validation.valid) {
      throw new Error(
        `Cannot pick ${player.name} at position ${position.toString()}: ${validation.reason}`,
      );
    }
    const updated = new Map(this.slots);
    updated.set(position.getValue(), player);
    return new DraftSquad(updated, this.rules);
  }

  public requiredRoles(): ReadonlyArray<string> {
    const required: string[] = [];
    for (const [role, limit] of Object.entries(this.rules.limits)) {
      const deficit = limit.min - this.roleCount(role as PlayerRole);
      if (deficit > 0) required.push(role);
    }
    return required;
  }

  public totalRequiredPicks(): number {
    let total = 0;
    for (const [role, limit] of Object.entries(this.rules.limits)) {
      const deficit = limit.min - this.roleCount(role as PlayerRole);
      if (deficit > 0) total += deficit;
    }
    return total;
  }
}
