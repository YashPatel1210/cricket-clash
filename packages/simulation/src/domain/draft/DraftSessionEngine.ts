import { RandomGenerator } from "../../infrastructure/random";

import { PlayerPool } from "./PlayerPool";
import { DraftParticipant } from "./DraftParticipant";
import { DraftSession } from "./DraftSession";
import { DraftSessionConfig, DEFAULT_DRAFT_CONFIG } from "./DraftSessionConfig";
import { DraftRoundGenerator } from "./DraftRoundGenerator";

/**
 * DraftSessionEngine — creates and orchestrates two-player independent draft sessions.
 *
 * INDEPENDENT ROUND STREAMS:
 *   Each participant receives their own randomly generated sequence of rounds.
 *   User A might see: India → Pakistan → Australia → England → India → ...
 *   User B might see: Australia → India → South Africa → Pakistan → Australia → ...
 *
 *   The sequences are generated independently from the same pool but with different
 *   random seeds to ensure variety.
 *
 * Usage:
 *
 *   const engine  = new DraftSessionEngine(pool, new RandomGenerator(seed));
 *   const session = engine.createSession("alice", "bob");
 *
 *   // Each user sees their own current round
 *   console.log(session.participantA.getCurrentRound()?.country); // e.g. "India"
 *   console.log(session.participantB.getCurrentRound()?.country); // e.g. "Australia"
 *
 *   // User A picks from their India round
 *   const optionsA = session.getOptionsFor("alice");
 *   const pick = optionsA.find(o => o.isSelectable());
 *   const r1 = session.pick("alice", pick.player, pick.eligiblePositions[0]);
 *
 *   // User B picks from their Australia round
 *   const optionsB = session.getOptionsFor("bob");
 *   const pick2 = optionsB.find(o => o.isSelectable());
 *   const r2 = r1.session.pick("bob", pick2.player, pick2.eligiblePositions[0]);
 *   // → turn advances, both move to their next round
 */
export class DraftSessionEngine {
  public constructor(
    private readonly pool: PlayerPool,
    private readonly random: RandomGenerator,
  ) {}

  public createSession(
    userIdA: string,
    userIdB: string,
    config: DraftSessionConfig = DEFAULT_DRAFT_CONFIG,
  ): DraftSession {
    // Filter to countries with enough players (≥ 11) in the pool
    const validCountries = config.countries.filter(
      (c) => this.pool.playersFromCountry(c).length >= 11,
    );

    if (validCountries.length === 0) {
      throw new Error(
        "No countries in the pool have enough players (≥ 11) to generate draft rounds.",
      );
    }

    // Generate SEPARATE round sequences for each participant.
    // Use two different generators (different seeds) so A and B see different shuffles.
    const seedA = Math.floor(this.random.nextFloat() * 1_000_000);
    const seedB = Math.floor(this.random.nextFloat() * 1_000_000);

    const generatorA = new DraftRoundGenerator(new RandomGenerator(seedA));
    const generatorB = new DraftRoundGenerator(new RandomGenerator(seedB));

    const roundsA = generatorA.generateRounds(this.pool, validCountries, config.totalRounds);
    const roundsB = generatorB.generateRounds(this.pool, validCountries, config.totalRounds);

    const participantA = DraftParticipant.create(userIdA, roundsA, config.squadRules);
    const participantB = DraftParticipant.create(userIdB, roundsB, config.squadRules);

    const sessionId = `draft-${Date.now()}-${Math.floor(this.random.nextFloat() * 10_000)}`;

    return DraftSession.create(
      sessionId,
      participantA,
      participantB,
      this.pool.getPlayers(),  // pass full pool for fallback injection
    );
  }
}
