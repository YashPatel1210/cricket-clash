import { RandomGenerator } from "../../infrastructure/random";

import { PlayerPool } from "./PlayerPool";
import { DraftParticipant } from "./DraftParticipant";
import { DraftSession } from "./DraftSession";
import { DraftSessionConfig, DEFAULT_DRAFT_CONFIG } from "./DraftSessionConfig";
import { DraftRoundGenerator } from "./DraftRoundGenerator";

/**
 * DraftSessionEngine — creates and orchestrates two-player draft sessions.
 *
 * Usage:
 *
 *   const engine  = new DraftSessionEngine(pool, new RandomGenerator(seed));
 *   const session = engine.createSession("player-a", "player-b");
 *
 *   // Show round to both players
 *   const round   = session.getCurrentRound();
 *   const optionsA = session.getOptionsFor("player-a");
 *   const optionsB = session.getOptionsFor("player-b");
 *
 *   // Player A picks
 *   const result = session.pick("player-a", kohli, BattingPosition.of(3));
 *   if (result.success) {
 *     session = result.session;
 *   }
 *
 *   // Player B picks
 *   const result2 = session.pick("player-b", rohit, BattingPosition.of(1));
 *   if (result2.success) {
 *     session = result2.session;   // round advances automatically
 *   }
 */
export class DraftSessionEngine {
  private readonly roundGenerator: DraftRoundGenerator;

  public constructor(
    private readonly pool: PlayerPool,
    private readonly random: RandomGenerator,
  ) {
    this.roundGenerator = new DraftRoundGenerator(random);
  }

  /**
   * Creates a new draft session for two participants.
   *
   * Generates rounds based on the config's countries and totalRounds.
   * Both participants start with empty squads.
   */
  public createSession(
    userIdA: string,
    userIdB: string,
    config: DraftSessionConfig = DEFAULT_DRAFT_CONFIG,
  ): DraftSession {
    // Filter countries to only those that have players in the pool
    const availableCountries = config.countries.filter(
      (c) => this.pool.playersFromCountry(c).length >= 11,
    );

    if (availableCountries.length === 0) {
      throw new Error(
        "No countries in the pool have enough players (≥ 11) to generate draft rounds.",
      );
    }

    const rounds = this.roundGenerator.generateRounds(
      this.pool,
      availableCountries,
      config.totalRounds,
    );

    const participantA = DraftParticipant.create(userIdA, config.squadRules);
    const participantB = DraftParticipant.create(userIdB, config.squadRules);

    const sessionId = `draft-${Date.now()}-${Math.floor(this.random.nextFloat() * 10000)}`;

    return DraftSession.create(sessionId, participantA, participantB, rounds);
  }
}
