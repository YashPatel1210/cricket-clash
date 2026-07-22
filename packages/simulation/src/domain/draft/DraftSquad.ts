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
  | "PLAYER_ALREADY_IN_SQUAD";

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

  // ── Queries ─────────────────────────────────────────────────────────

  public size(): number {
    return this.slots.size;
  }

  public isComplete(): boolean {
    return this.slots.size === this.rules.squadSize;
  }

  public isFull(): boolean {
    return this.slots.size >= this.rules.squadSize;
  }

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

  public roleCount(role: PlayerRole): number {
    return Array.from(this.slots.values()).filter((p) => p.role === role).length;
  }

  public getRules(): SquadCompositionRules {
    return this.rules;
  }

  /**
   * Returns positions where this player can be legally placed,
   * considering: role range, occupied slots, and remaining composition space.
   */
  public eligiblePositionsFor(player: Player): ReadonlyArray<BattingPosition> {
    const range = PositionRange.RANGES[player.role as string];
    if (!range) return [];

    const roleLimit = this.rules.limits[player.role as string];
    const roleMax   = roleLimit?.max ?? 99;

    return range.eligiblePositions().filter((pos) => {
      if (this.slots.has(pos.getValue())) return false;
      if (this.roleCount(player.role) >= roleMax)   return false;
      if (this.isFull())                             return false;
      return true;
    });
  }

  // ── Validation ───────────────────────────────────────────────────────

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

    return { valid: true };
  }

  // ── Mutation ─────────────────────────────────────────────────────────

  /**
   * Adds a player to the squad at the specified position.
   * Throws if the pick is invalid — call canPick() first to check.
   */
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

  /**
   * Returns role strings that still need more players to reach their minimum.
   */
  public requiredRoles(): ReadonlyArray<string> {
    const required: string[] = [];
    for (const [role, limit] of Object.entries(this.rules.limits)) {
      const deficit = limit.min - this.roleCount(role as PlayerRole);
      if (deficit > 0) required.push(role);
    }
    return required;
  }

  /**
   * Total number of players still required across all roles below minimum.
   * Used to enforce minimum picks when slots are running low.
   */
  public totalRequiredPicks(): number {
    let total = 0;
    for (const [role, limit] of Object.entries(this.rules.limits)) {
      const deficit = limit.min - this.roleCount(role as PlayerRole);
      if (deficit > 0) total += deficit;
    }
    return total;
  }
}
