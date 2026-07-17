import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { DraftPickOption, buildPickOptions } from "./DraftPickOption";
import { DraftRound } from "./DraftRoundGenerator";
import { DraftSquad } from "./DraftSquad";
import { PickValidation } from "./DraftSquad";
import { SquadCompositionRules, T20_SQUAD_RULES } from "./SquadCompositionRules";

/**
 * DraftParticipant — one player's state in the two-player draft session.
 *
 * Immutable. Every pick returns a new DraftParticipant.
 */
export class DraftParticipant {
  private constructor(
    public readonly userId: string,
    public readonly squad: DraftSquad,
    public readonly hasMadePickThisRound: boolean,
  ) {}

  public static create(
    userId: string,
    rules: SquadCompositionRules = T20_SQUAD_RULES,
  ): DraftParticipant {
    return new DraftParticipant(userId, DraftSquad.empty(rules), false);
  }

  // ── Round view ────────────────────────────────────────────────────────

  /**
   * Returns this participant's view of the current draft round —
   * each player tagged with availability status and eligible positions.
   */
  public getRoundOptions(round: DraftRound): ReadonlyArray<DraftPickOption> {
    return buildPickOptions(round.players, this.squad);
  }

  // ── Pick ────────────────────────────────────────────────────────────

  public canPick(player: Player, position: BattingPosition): PickValidation {
    return this.squad.canPick(player, position);
  }

  /**
   * Records a pick, advancing the squad state.
   * Throws if the pick is invalid.
   */
  public pick(player: Player, position: BattingPosition): DraftParticipant {
    const updated = this.squad.pick(player, position);
    return new DraftParticipant(this.userId, updated, true);
  }

  /** Marks the participant as having "passed" (skipped) this round. */
  public pass(): DraftParticipant {
    return new DraftParticipant(this.userId, this.squad, true);
  }

  /** Resets the round-pick flag for the next round. */
  public resetForNextRound(): DraftParticipant {
    return new DraftParticipant(this.userId, this.squad, false);
  }

  // ── Status ────────────────────────────────────────────────────────────

  public isSquadComplete(): boolean {
    return this.squad.isComplete();
  }

  public pickedCount(): number {
    return this.squad.size();
  }

  public hasPickableOptions(round: DraftRound): boolean {
    return this.getRoundOptions(round).some((o) => o.isSelectable());
  }
}
