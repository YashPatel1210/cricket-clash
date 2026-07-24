import { Player } from "../player";

import { BattingPosition } from "./BattingPosition";
import { DraftParticipant } from "./DraftParticipant";
import { DraftPickOption } from "./DraftPickOption";
import { DraftPickStatus } from "./DraftPickStatus";
import { DraftSessionStatus } from "./DraftSessionStatus";

export type DraftPickResult =
  | { success: true; session: DraftSession }
  | { success: false; reason: string };

/**
 * DraftSession — the complete two-player draft state.
 *
 * Each participant has their own independent queue of draft rounds.
 * Each participant advances independently. This lets two remote players draft
 * in parallel without one player's pick blocking the other player's next pack.
 *
 * FALLBACK GUARANTEE:
 *   If the current round contains no eligible players for a required role,
 *   `getOptionsFor()` automatically injects suitable players from the full
 *   player pool. This ensures a user is never stuck unable to fill minimums.
 *
 * POSITION LOCKOUT PREVENTION:
 *   `DraftSquad.canPick()` rejects picks that would close off all valid
 *   positions for a still-required role.
 *
 * Immutable — every mutation returns a new DraftSession.
 */
export class DraftSession {
  private constructor(
    public readonly id: string,
    public readonly participantA: DraftParticipant,
    public readonly participantB: DraftParticipant,
    public readonly turnNumber: number,
    public readonly status: DraftSessionStatus,
    /** Full player pool used to inject fallback options when needed. */
    private readonly playerPool: ReadonlyArray<Player>,
  ) {}

  public static create(
    id: string,
    participantA: DraftParticipant,
    participantB: DraftParticipant,
    playerPool: ReadonlyArray<Player> = [],
  ): DraftSession {
    return new DraftSession(
      id, participantA, participantB, 1, DraftSessionStatus.ACTIVE, playerPool,
    );
  }

  // ── Participant access ─────────────────────────────────────────────────

  public getParticipant(userId: string): DraftParticipant | undefined {
    if (this.participantA.userId === userId) return this.participantA;
    if (this.participantB.userId === userId) return this.participantB;
    return undefined;
  }

  /**
   * Returns options for the participant's current round.
   *
   * AUGMENTATION: if the round has no selectable players for a required role,
   * injects fallback players from the global pool who CAN fit the squad.
   * This guarantees users are never unable to fill minimum requirements.
   */
  public getOptionsFor(userId: string): ReadonlyArray<DraftPickOption> {
    const participant = this.getParticipant(userId);
    if (!participant) return [];

    const round = participant.getCurrentRound();
    if (!round) return [];

    const standardOptions = participant.getCurrentOptions();
    const requiredRoles   = participant.squad.requiredRoles();

    // Check which required roles are covered by selectable options in this round
    const coveredRoles = new Set(
      standardOptions
        .filter((o) => o.isSelectable())
        .map((o) => o.player.role as string),
    );

    const uncoveredRequired = requiredRoles.filter((r) => !coveredRoles.has(r));

    // All required roles are covered — return standard options
    if (uncoveredRequired.length === 0) return standardOptions;

    // Augment with fallback players from the pool
    const augmented = [...standardOptions];
    const existingIds = new Set([
      ...round.players.map((p) => p.id),
      ...augmented.map((o) => o.player.id),
    ]);

    for (const role of uncoveredRequired) {
      const candidates = this.playerPool
        .filter((p) => (p.role as string) === role)
        .filter((p) => !participant.squad.hasPlayer(p.id))
        .filter((p) => !existingIds.has(p.id))
        .filter((p) => participant.squad.eligiblePositionsFor(p).length > 0)
        .slice(0, 3); // up to 3 fallback players per missing role

      for (const player of candidates) {
        const positions = participant.squad.eligiblePositionsFor(player);
        augmented.push(new DraftPickOption(player, DraftPickStatus.AVAILABLE, positions));
        existingIds.add(player.id);
      }
    }

    return augmented;
  }

  public isComplete(): boolean {
    return this.status === DraftSessionStatus.COMPLETED;
  }

  // ── Pick / Pass ─────────────────────────────────────────────────────────

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

    // Player must be in the round OR be a fallback from the global pool
    const inRound = round.players.some((p) => p.id === player.id);
    const inPool  = this.playerPool.some((p) => p.id === player.id);
    if (!inRound && !inPool) {
      return { success: false, reason: `${player.name} is not available.` };
    }

    const validation = participant.canPick(player, position);
    if (!validation.valid) {
      return { success: false, reason: validation.reason ?? "Invalid pick." };
    }

    const updated = participant.pick(player, position);
    return { success: true, session: this.applyUpdate(userId, updated) };
  }

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

  // ── Internal ─────────────────────────────────────────────────────────────

  private applyUpdate(userId: string, updated: DraftParticipant): DraftSession {
    // A participant immediately moves to their next pack after acting. The
    // opponent's state is intentionally untouched, enabling parallel drafting.
    const nextParticipant = updated.isSquadComplete()
      ? updated
      : updated.advanceRound();
    const newA = this.participantA.userId === userId ? nextParticipant : this.participantA;
    const newB = this.participantB.userId === userId ? nextParticipant : this.participantB;

    const completed = newA.isSquadComplete() && newB.isSquadComplete();
    return new DraftSession(
      this.id,
      newA,
      newB,
      this.turnNumber + 1,
      completed ? DraftSessionStatus.COMPLETED : DraftSessionStatus.ACTIVE,
      this.playerPool,
    );
  }

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
