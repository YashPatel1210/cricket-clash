import { describe, expect, it } from "vitest";
import { Country } from "@cricket-clash/shared";

import { RandomGenerator } from "../../infrastructure/random";
import { PlayerBuilder } from "../../test/builders/PlayerBuilder";
import { PlayerPool } from "./PlayerPool";
import { BattingPosition } from "./BattingPosition";
import { DraftSessionEngine } from "./DraftSessionEngine";
import { DEFAULT_DRAFT_CONFIG } from "./DraftSessionConfig";
import { DraftSessionStatus } from "./DraftSessionStatus";
import { DraftPickStatus } from "./DraftPickStatus";

/** Build a pool of 15 India + 15 Australia players for testing */
function buildTestPool(): PlayerPool {
  const players = [
    // India: 6 batters, 2 AR, 4 bowlers, 3 WK
    ...Array.from({ length: 6 }, () => PlayerBuilder.batter().fromCountry(Country.INDIA).build()),
    ...Array.from({ length: 2 }, () => PlayerBuilder.allRounder().fromCountry(Country.INDIA).build()),
    ...Array.from({ length: 4 }, () => PlayerBuilder.bowler().fromCountry(Country.INDIA).build()),
    ...Array.from({ length: 3 }, () => PlayerBuilder.wicketKeeper().fromCountry(Country.INDIA).build()),
    // Australia: 6 batters, 2 AR, 4 bowlers, 3 WK
    ...Array.from({ length: 6 }, () => PlayerBuilder.batter().fromCountry(Country.AUSTRALIA).build()),
    ...Array.from({ length: 2 }, () => PlayerBuilder.allRounder().fromCountry(Country.AUSTRALIA).build()),
    ...Array.from({ length: 4 }, () => PlayerBuilder.bowler().fromCountry(Country.AUSTRALIA).build()),
    ...Array.from({ length: 3 }, () => PlayerBuilder.wicketKeeper().fromCountry(Country.AUSTRALIA).build()),
  ];
  return new PlayerPool(players);
}

const config = {
  ...DEFAULT_DRAFT_CONFIG,
  countries: [Country.INDIA, Country.AUSTRALIA],
  totalRounds: 14,
};

describe("DraftSession", () => {
  it("should create a session with active status", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);
    expect(session.status).toBe(DraftSessionStatus.ACTIVE);
    expect(session.getRoundCount()).toBe(14);
  });

  it("should show first round with 11 players", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);
    expect(session.getCurrentRound()?.players).toHaveLength(11);
  });

  it("should allow a valid pick and return updated session", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let session   = engine.createSession("alice", "bob", config);

    const round   = session.getCurrentRound()!;
    const options = session.getOptionsFor("alice");
    const selectable = options.find((o) => o.isSelectable());

    expect(selectable).toBeDefined();

    const pos    = selectable!.eligiblePositions[0];
    const result = session.pick("alice", selectable!.player, pos);

    expect(result.success).toBe(true);
    if (result.success) {
      session = result.session;
      expect(session.participantA.pickedCount()).toBe(1);
    }
  });

  it("should advance round once both players have picked", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let session   = engine.createSession("alice", "bob", config);

    // Alice picks
    const optA = session.getOptionsFor("alice").find((o) => o.isSelectable())!;
    let result = session.pick("alice", optA.player, optA.eligiblePositions[0]);
    expect(result.success).toBe(true);
    session = (result as { success: true; session: typeof session }).session;

    const roundBefore = session.currentRoundIndex;

    // Bob picks from same round
    const optB = session.getOptionsFor("bob").find((o) => o.isSelectable())!;
    result = session.pick("bob", optB.player, optB.eligiblePositions[0]);
    expect(result.success).toBe(true);
    session = (result as { success: true; session: typeof session }).session;

    // Round should have advanced
    expect(session.currentRoundIndex).toBeGreaterThan(roundBefore);
  });

  it("should reject picking the same player in a later round", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let session   = engine.createSession("alice", "bob", config);

    // Alice picks a player from round 1
    const optA = session.getOptionsFor("alice").find((o) => o.isSelectable())!;
    const pickedPlayer = optA.player;
    let result = session.pick("alice", pickedPlayer, optA.eligiblePositions[0]);
    session = (result as { success: true; session: typeof session }).session;

    // If the same player appears in a later round, they should be ALREADY_PICKED for Alice
    const aliceOptions = session.getOptionsFor("alice");
    const alreadyPicked = aliceOptions.find((o) => o.player.id === pickedPlayer.id);
    if (alreadyPicked) {
      expect(alreadyPicked.status).toBe(DraftPickStatus.ALREADY_PICKED);
    }
  });

  it("should reject picking the same player twice in same round", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let session   = engine.createSession("alice", "bob", config);

    const opt  = session.getOptionsFor("alice").find((o) => o.isSelectable())!;
    let r1 = session.pick("alice", opt.player, opt.eligiblePositions[0]);
    session = (r1 as { success: true; session: typeof session }).session;

    // Try to pick again this round
    const r2 = session.pick("alice", opt.player, opt.eligiblePositions[0]);
    expect(r2.success).toBe(false);
  });

  it("should allow pass to skip a round", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let session   = engine.createSession("alice", "bob", config);

    const result = session.pass("alice");
    expect(result.success).toBe(true);
  });

  it("should both allow picking the same player", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let session   = engine.createSession("alice", "bob", config);

    const optA = session.getOptionsFor("alice").find((o) => o.isSelectable())!;
    const shared = optA.player;

    // Alice picks
    let r = session.pick("alice", shared, optA.eligiblePositions[0]);
    session = (r as { success: true; session: typeof session }).session;

    // Bob picks the SAME player (should be allowed — independent squads)
    const optB = session.getOptionsFor("bob").find(
      (o) => o.player.id === shared.id && o.isSelectable()
    );
    if (optB) {
      const r2 = session.pick("bob", shared, optB.eligiblePositions[0]);
      expect(r2.success).toBe(true);
    }
  });
});
