import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { DraftParticipant } from "./DraftParticipant";
import { DraftPickOption } from "./DraftPickOption";
import { DraftSessionStatus } from "./DraftSessionStatus";

export type DraftPickResult =
  | { success: true; session: DraftSession }
  | { success: false; reason: string };

/**
 * DraftSession — the complete two-player draft state.
 *
 * INDEPENDENT ROUND STREAMS:
 *   Each participant has their own queue of draft rounds.
 *   In any given turn:
 *     - User A is shown Team India (their current round)
 *     - User B is shown Team Australia (their current round)
 *   They are completely different teams — picked independently.
 *
 * SYNCHRONISATION:
 *   Both participants act in each "turn" (pick or pass).
 *   When BOTH have acted, the turn ends and both advance to their next round.
 *   This keeps the draft in lock-step — neither player gets ahead of the other.
 *
 * PLAYER UNIQUENESS PER USER:
 *   If Kohli appeared in User A's round 1 and they picked him, and Kohli
 *   appears again in User A's round 5, he will be marked ALREADY_PICKED
 *   for User A only. User B's picks are completely independent.
 *
 * BOTH USERS CAN PICK THE SAME PLAYER:
 *   Each user builds their own squad — there is no shared player pool.
 *   If Kohli appears in A's round 1 AND B's round 3, both can pick him.
 *
 * Immutable — every mutation returns a new DraftSession.
 */
export class DraftSession {
  private constructor(
    public readonly id: string,
    public readonly participantA: DraftParticipant,
    public readonly participantB: DraftParticipant,
    /** The current synchronised turn number (1-indexed). */
    public readonly turnNumber: number,
    public readonly status: DraftSessionStatus,
  ) {}

  public static create(
    id: string,
    participantA: DraftParticipant,
    participantB: DraftParticipant,
  ): DraftSession {
    return new DraftSession(id, participantA, participantB, 1, DraftSessionStatus.ACTIVE);
  }

  // ── Current state ─────────────────────────────────────────────────────

  public getParticipant(userId: string): DraftParticipant | undefined {
    if (this.participantA.userId === userId) return this.participantA;
    if (this.participantB.userId === userId) return this.participantB;
    return undefined;
  }

  /**
   * Returns the current options for a participant — their OWN current round.
   * User A's options come from their round; User B's from their own round.
   */
  public getOptionsFor(userId: string): ReadonlyArray<DraftPickOption> {
    return this.getParticipant(userId)?.getCurrentOptions() ?? [];
  }

  public isComplete(): boolean {
    return this.status === DraftSessionStatus.COMPLETED;
  }

  // ── Pick / Pass ───────────────────────────────────────────────────────

  /**
   * Records a player pick for the given participant from their own current round.
   *
   * Validation:
   *   - Session must be ACTIVE
   *   - Participant must not have already acted this turn
   *   - Player must exist in THAT PARTICIPANT'S current round
   *   - Pick must pass DraftSquad validation
   *
   * When both participants have acted, the turn advances automatically.
   */
  public pick(
    userId: string,
    player: Player,
    position: BattingPosition,
  ): DraftPickResult {
    if (this.status !== DraftSessionStatus.ACTIVE) {
      return { success: false, reason: "Draft session is not active." };
    }

    const participant = this.getParticipant(userId);
    if (!participant) {
      return { success: false, reason: `Unknown participant: ${userId}` };
    }

    if (participant.hasMadePickThisRound) {
      return { success: false, reason: "You have already acted this turn." };
    }

    const round = participant.getCurrentRound();
    if (!round) {
      return { success: false, reason: "No more rounds available." };
    }

    // Player must be in THIS participant's current round
    if (!round.players.some((p) => p.id === player.id)) {
      return { success: false, reason: `${player.name} is not in your current round.` };
    }

    const validation = participant.canPick(player, position);
    if (!validation.valid) {
      return { success: false, reason: validation.reason ?? "Invalid pick." };
    }

    const updated = participant.pick(player, position);
    return { success: true, session: this.applyUpdate(userId, updated) };
  }

  /**
   * Passes (skips) the current turn for the given participant.
   * Useful when no player in the current round suits the squad.
   */
  public pass(userId: string): DraftPickResult {
    if (this.status !== DraftSessionStatus.ACTIVE) {
      return { success: false, reason: "Draft session is not active." };
    }

    const participant = this.getParticipant(userId);
    if (!participant) {
      return { success: false, reason: `Unknown participant: ${userId}` };
    }

    if (participant.hasMadePickThisRound) {
      return { success: false, reason: "You have already acted this turn." };
    }

    const updated = participant.pass();
    return { success: true, session: this.applyUpdate(userId, updated) };
  }

  // ── Internal ──────────────────────────────────────────────────────────

  private applyUpdate(
    userId: string,
    updated: DraftParticipant,
  ): DraftSession {
    const newA = this.participantA.userId === userId ? updated : this.participantA;
    const newB = this.participantB.userId === userId ? updated : this.participantB;

    // If both have acted this turn, advance to next turn
    if (newA.hasMadePickThisRound && newB.hasMadePickThisRound) {
      return this.advanceTurn(newA, newB);
    }

    return new DraftSession(
      this.id, newA, newB, this.turnNumber, this.status,
    );
  }

  /**
   * Advances both participants to their respective next rounds.
   * Completes the session if both squads are done or rounds exhausted.
   */
  private advanceTurn(
    participantA: DraftParticipant,
    participantB: DraftParticipant,
  ): DraftSession {
    const nextA = participantA.advanceRound();
    const nextB = participantB.advanceRound();

    const bothComplete    = nextA.isSquadComplete() && nextB.isSquadComplete();
    const aOutOfRounds    = !nextA.hasMoreRounds();
    const bOutOfRounds    = !nextB.hasMoreRounds();
    const aDoneOrExhausted = nextA.isSquadComplete() || aOutOfRounds;
    const bDoneOrExhausted = nextB.isSquadComplete() || bOutOfRounds;

    if (aDoneOrExhausted && bDoneOrExhausted) {
      return new DraftSession(
        this.id, nextA, nextB, this.turnNumber + 1, DraftSessionStatus.COMPLETED,
      );
    }

    return new DraftSession(
      this.id, nextA, nextB, this.turnNumber + 1, DraftSessionStatus.ACTIVE,
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────

  public summary(): string {
    const a = this.participantA;
    const b = this.participantB;
    const roundA = a.getCurrentRound();
    const roundB = b.getCurrentRound();

    return (
      `Turn ${this.turnNumber} | ` +
      `${a.userId}: ${a.pickedCount()}/11 [${roundA?.country ?? "—"}] | ` +
      `${b.userId}: ${b.pickedCount()}/11 [${roundB?.country ?? "—"}]`
    );
  }
}
