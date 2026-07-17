import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { DraftParticipant } from "./DraftParticipant";
import { DraftPickOption } from "./DraftPickOption";
import { DraftRound } from "./DraftRoundGenerator";
import { DraftSessionStatus } from "./DraftSessionStatus";

export type DraftPickResult =
  | { success: true; session: DraftSession }
  | { success: false; reason: string };

/**
 * DraftSession — the complete two-player draft state.
 *
 * Rules:
 *   - Both participants see the same round simultaneously
 *   - Each may pick exactly ONE player per round (or pass)
 *   - Once both have picked/passed, the session advances to the next round
 *   - A player can be picked by BOTH participants independently
 *   - A player already picked by a participant is disabled for THAT participant only
 *   - Session completes when both squads are full OR all rounds are exhausted
 *
 * Immutable — every mutation returns a new DraftSession.
 */
export class DraftSession {
  private constructor(
    public readonly id: string,
    public readonly participantA: DraftParticipant,
    public readonly participantB: DraftParticipant,
    public readonly rounds: ReadonlyArray<DraftRound>,
    public readonly currentRoundIndex: number,
    public readonly status: DraftSessionStatus,
  ) {}

  public static create(
    id: string,
    participantA: DraftParticipant,
    participantB: DraftParticipant,
    rounds: ReadonlyArray<DraftRound>,
  ): DraftSession {
    return new DraftSession(
      id,
      participantA,
      participantB,
      rounds,
      0,
      DraftSessionStatus.ACTIVE,
    );
  }

  // ── Current round ────────────────────────────────────────────────────

  public getCurrentRound(): DraftRound | undefined {
    return this.rounds[this.currentRoundIndex];
  }

  public getRoundCount(): number {
    return this.rounds.length;
  }

  public getRoundNumber(): number {
    return this.currentRoundIndex + 1;
  }

  // ── Participant access ────────────────────────────────────────────────

  public getParticipant(userId: string): DraftParticipant | undefined {
    if (this.participantA.userId === userId) return this.participantA;
    if (this.participantB.userId === userId) return this.participantB;
    return undefined;
  }

  public getOptionsFor(userId: string): ReadonlyArray<DraftPickOption> {
    const round = this.getCurrentRound();
    if (!round) return [];
    const participant = this.getParticipant(userId);
    if (!participant) return [];
    return participant.getRoundOptions(round);
  }

  // ── Pick logic ────────────────────────────────────────────────────────

  /**
   * Records a player pick for the given participant.
   *
   * Rules enforced:
   *   - Session must be ACTIVE
   *   - Participant must not have already picked this round
   *   - Pick must pass DraftSquad validation
   *
   * After a successful pick, if both participants have now acted (picked/passed),
   * the session automatically advances to the next round.
   */
  public pick(
    userId: string,
    player: Player,
    position: BattingPosition,
  ): DraftPickResult {
    if (this.status !== DraftSessionStatus.ACTIVE) {
      return { success: false, reason: "Draft session is not active." };
    }

    const round = this.getCurrentRound();
    if (!round) {
      return { success: false, reason: "No current round." };
    }

    if (!round.players.some((p) => p.id === player.id)) {
      return { success: false, reason: "Player is not in the current round." };
    }

    const participant = this.getParticipant(userId);
    if (!participant) {
      return { success: false, reason: `Unknown participant: ${userId}` };
    }

    if (participant.hasMadePickThisRound) {
      return { success: false, reason: "You have already picked this round." };
    }

    const validation = participant.canPick(player, position);
    if (!validation.valid) {
      return { success: false, reason: validation.reason ?? "Invalid pick." };
    }

    const updated = participant.pick(player, position);
    return { success: true, session: this.applyParticipantUpdate(userId, updated) };
  }

  /**
   * Passes (skips) the current round pick for the given participant.
   * Useful when no player in the round is suitable.
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
      return { success: false, reason: "You have already acted this round." };
    }

    const updated = participant.pass();
    return { success: true, session: this.applyParticipantUpdate(userId, updated) };
  }

  // ── Internal helpers ──────────────────────────────────────────────────

  private applyParticipantUpdate(
    userId: string,
    updated: DraftParticipant,
  ): DraftSession {
    const newA = this.participantA.userId === userId ? updated : this.participantA;
    const newB = this.participantB.userId === userId ? updated : this.participantB;

    // If both have acted, advance the round
    if (newA.hasMadePickThisRound && newB.hasMadePickThisRound) {
      return this.advance(newA, newB);
    }

    return new DraftSession(
      this.id,
      newA,
      newB,
      this.rounds,
      this.currentRoundIndex,
      this.status,
    );
  }

  /**
   * Advances to the next round. If all rounds are exhausted or both squads
   * are complete, marks the session as COMPLETED.
   */
  private advance(
    participantA: DraftParticipant,
    participantB: DraftParticipant,
  ): DraftSession {
    const resetA = participantA.resetForNextRound();
    const resetB = participantB.resetForNextRound();

    const nextIndex = this.currentRoundIndex + 1;
    const bothComplete = resetA.isSquadComplete() && resetB.isSquadComplete();
    const noMoreRounds = nextIndex >= this.rounds.length;

    if (bothComplete || noMoreRounds) {
      return new DraftSession(
        this.id,
        resetA,
        resetB,
        this.rounds,
        nextIndex,
        DraftSessionStatus.COMPLETED,
      );
    }

    // Auto-skip rounds where neither participant has pickable options
    let skipIndex = nextIndex;
    while (skipIndex < this.rounds.length) {
      const nextRound = this.rounds[skipIndex];
      const aHasPicks = !resetA.isSquadComplete() && resetA.hasPickableOptions(nextRound);
      const bHasPicks = !resetB.isSquadComplete() && resetB.hasPickableOptions(nextRound);
      if (aHasPicks || bHasPicks) break;
      skipIndex++;
    }

    if (skipIndex >= this.rounds.length) {
      return new DraftSession(
        this.id,
        resetA,
        resetB,
        this.rounds,
        skipIndex,
        DraftSessionStatus.COMPLETED,
      );
    }

    return new DraftSession(
      this.id,
      resetA,
      resetB,
      this.rounds,
      skipIndex,
      DraftSessionStatus.ACTIVE,
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────

  public isComplete(): boolean {
    return this.status === DraftSessionStatus.COMPLETED;
  }

  public summary(): string {
    const a = this.participantA;
    const b = this.participantB;
    return (
      `Round ${this.getRoundNumber()}/${this.getRoundCount()} | ` +
      `${a.userId}: ${a.pickedCount()}/11 | ${b.userId}: ${b.pickedCount()}/11`
    );
  }
}
