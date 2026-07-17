import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { DraftPickOption, buildPickOptions } from "./DraftPickOption";
import { DraftRound } from "./DraftRoundGenerator";
import { DraftSquad } from "./DraftSquad";
import { PickValidation } from "./DraftSquad";
import { SquadCompositionRules, T20_SQUAD_RULES } from "./SquadCompositionRules";

/**
 * DraftParticipant — one user's complete draft state.
 *
 * Each participant has their OWN independent queue of draft rounds.
 * User A may be viewing India while User B is viewing Australia simultaneously.
 *
 * Immutable — every mutation returns a new DraftParticipant.
 */
export class DraftParticipant {
  private constructor(
    public readonly userId: string,
    public readonly squad: DraftSquad,
    /** This participant's own sequence of draft rounds (independent per user). */
    public readonly rounds: ReadonlyArray<DraftRound>,
    /** Index into this participant's own rounds array. */
    public readonly roundIndex: number,
    public readonly hasMadePickThisRound: boolean,
  ) {}

  public static create(
    userId: string,
    rounds: ReadonlyArray<DraftRound>,
    rules: SquadCompositionRules = T20_SQUAD_RULES,
  ): DraftParticipant {
    return new DraftParticipant(userId, DraftSquad.empty(rules), rounds, 0, false);
  }

  // ── Current round ─────────────────────────────────────────────────────

  public getCurrentRound(): DraftRound | undefined {
    return this.rounds[this.roundIndex];
  }

  public getTotalRounds(): number {
    return this.rounds.length;
  }

  public getRoundNumber(): number {
    return this.roundIndex + 1;
  }

  // ── Options for this participant's current round ───────────────────────

  /**
   * Returns this participant's pickable options for their current round.
   * Players already in their squad are disabled. Role/position limits applied.
   */
  public getCurrentOptions(): ReadonlyArray<DraftPickOption> {
    const round = this.getCurrentRound();
    if (!round) return [];
    return buildPickOptions(round.players, this.squad);
  }

  // ── Pick ───────────────────────────────────────────────────────────────

  public canPick(player: Player, position: BattingPosition): PickValidation {
    return this.squad.canPick(player, position);
  }

  /** Records a pick. Player must exist in the current round. */
  public pick(player: Player, position: BattingPosition): DraftParticipant {
    const updated = this.squad.pick(player, position);
    return new DraftParticipant(this.userId, updated, this.rounds, this.roundIndex, true);
  }

  /** Skips this round without picking. */
  public pass(): DraftParticipant {
    return new DraftParticipant(this.userId, this.squad, this.rounds, this.roundIndex, true);
  }

  /** Advances to the next round in this participant's own queue. */
  public advanceRound(): DraftParticipant {
    const next = this.roundIndex + 1;
    return new DraftParticipant(this.userId, this.squad, this.rounds, next, false);
  }

  // ── Status ─────────────────────────────────────────────────────────────

  public isSquadComplete(): boolean  { return this.squad.isComplete(); }
  public pickedCount(): number       { return this.squad.size(); }
  public hasMoreRounds(): boolean    { return this.roundIndex < this.rounds.length; }

  public hasPickableOptions(): boolean {
    return this.getCurrentOptions().some((o) => o.isSelectable());
  }
}
