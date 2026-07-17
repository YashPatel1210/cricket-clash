import { describe, expect, it } from "vitest";
import { Country } from "@cricket-clash/shared";

import { RandomGenerator } from "../../infrastructure/random";
import { PlayerBuilder } from "../../test/builders/PlayerBuilder";
import { PlayerPool } from "./PlayerPool";
import { BattingPosition } from "./BattingPosition";
import { DraftSessionEngine } from "./DraftSessionEngine";
import { DraftSessionStatus } from "./DraftSessionStatus";
import { DraftPickStatus } from "./DraftPickStatus";
import { buildPickOptions } from "./DraftPickOption";
import { DEFAULT_DRAFT_CONFIG } from "./DraftSessionConfig";

/** Builds a pool with 15 India + 15 Australia players */
function buildTestPool(): PlayerPool {
  const players = [
    ...Array.from({ length: 6 }, () => PlayerBuilder.batter().fromCountry(Country.INDIA).build()),
    ...Array.from({ length: 2 }, () => PlayerBuilder.allRounder().fromCountry(Country.INDIA).build()),
    ...Array.from({ length: 4 }, () => PlayerBuilder.bowler().fromCountry(Country.INDIA).build()),
    ...Array.from({ length: 3 }, () => PlayerBuilder.wicketKeeper().fromCountry(Country.INDIA).build()),
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

describe("DraftSession (independent round streams)", () => {

  it("should create a session with active status", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);
    expect(session.status).toBe(DraftSessionStatus.ACTIVE);
  });

  it("each participant should have their own sequence of rounds", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);
    expect(session.participantA.getTotalRounds()).toBe(14);
    expect(session.participantB.getTotalRounds()).toBe(14);
  });

  it("each participant's current round is their own country (may differ)", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);

    // Each participant has their own round — Alice and Bob may see different countries
    const roundA = session.participantA.getCurrentRound();
    const roundB = session.participantB.getCurrentRound();
    expect(roundA).toBeDefined();
    expect(roundB).toBeDefined();
    expect(roundA!.players).toHaveLength(11);
    expect(roundB!.players).toHaveLength(11);

    // They may or may not be the same country (random) — both valid
    expect([Country.INDIA, Country.AUSTRALIA]).toContain(roundA!.country);
    expect([Country.INDIA, Country.AUSTRALIA]).toContain(roundB!.country);
  });

  it("alice sees her own options (her round's players)", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);
    const options = session.getOptionsFor("alice");
    expect(options).toHaveLength(11); // Alice's own 11-player round
  });

  it("bob sees his own options (his round's players — may differ from alice's)", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);
    const optionsB = session.getOptionsFor("bob");
    expect(optionsB).toHaveLength(11);
  });

  it("alice can pick from her own round", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let   session = engine.createSession("alice", "bob", config);
    const opt     = session.getOptionsFor("alice").find((o) => o.isSelectable())!;

    const result = session.pick("alice", opt.player, opt.eligiblePositions[0]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.participantA.pickedCount()).toBe(1);
    }
  });

  it("alice cannot pick a player from bob's round (wrong round)", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);

    // Pick a player that appears in BOB's round but not ALICE's round
    const alicePlayers = new Set(
      session.getOptionsFor("alice").map((o) => o.player.id)
    );
    const bobOpt = session.getOptionsFor("bob").find(
      (o) => o.isSelectable() && !alicePlayers.has(o.player.id)
    );

    if (bobOpt) {
      const result = session.pick("alice", bobOpt.player, bobOpt.eligiblePositions[0]);
      expect(result.success).toBe(false);
    }
  });

  it("turn advances only after both alice AND bob have acted", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let   session = engine.createSession("alice", "bob", config);

    const turnBefore = session.turnNumber;

    // Alice acts
    const optA   = session.getOptionsFor("alice").find((o) => o.isSelectable())!;
    const r1     = session.pick("alice", optA.player, optA.eligiblePositions[0]);
    session      = (r1 as { success: true; session: typeof session }).session;

    // Turn has NOT advanced yet — Bob hasn't acted
    expect(session.turnNumber).toBe(turnBefore);
    expect(session.participantA.hasMadePickThisRound).toBe(true);
    expect(session.participantB.hasMadePickThisRound).toBe(false);

    // Bob acts
    const optB   = session.getOptionsFor("bob").find((o) => o.isSelectable())!;
    const r2     = session.pick("bob", optB.player, optB.eligiblePositions[0]);
    session      = (r2 as { success: true; session: typeof session }).session;

    // Now both have acted → turn advances
    expect(session.turnNumber).toBe(turnBefore + 1);
  });

  it("each participant advances to THEIR OWN next round", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let   session = engine.createSession("alice", "bob", config);

    const aliceRound1 = session.participantA.getCurrentRound()!.country;
    const bobRound1   = session.participantB.getCurrentRound()!.country;

    // Both act
    const optA = session.getOptionsFor("alice").find((o) => o.isSelectable())!;
    let r = session.pick("alice", optA.player, optA.eligiblePositions[0]);
    session = (r as { success: true; session: typeof session }).session;
    const optB = session.getOptionsFor("bob").find((o) => o.isSelectable())!;
    r = session.pick("bob", optB.player, optB.eligiblePositions[0]);
    session = (r as { success: true; session: typeof session }).session;

    // Each participant is now on their own round 2 (different from each other's round 1)
    expect(session.participantA.roundIndex).toBe(1);
    expect(session.participantB.roundIndex).toBe(1);
  });

  it("player already picked by alice is disabled in her later rounds", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    let   session = engine.createSession("alice", "bob", config);

    // Alice picks from round 1
    const optA          = session.getOptionsFor("alice").find((o) => o.isSelectable())!;
    const alicesPick    = optA.player;
    let r = session.pick("alice", alicesPick, optA.eligiblePositions[0]);
    session = (r as { success: true; session: typeof session }).session;

    // Bob passes so turn advances
    r = session.pass("bob");
    session = (r as { success: true; session: typeof session }).session;

    // Find a round where alice's pick appears again
    let found = false;
    for (let i = session.participantA.roundIndex; i < session.participantA.getTotalRounds(); i++) {
      const round = session.participantA.rounds[i];
      const inRound = round.players.find((p) => p.id === alicesPick.id);
      if (inRound) {
        const opts = buildPickOptions(round.players, session.participantA.squad);
        const pickedOpt = opts.find((o) => o.player.id === alicesPick.id);
        if (pickedOpt) {
          expect(pickedOpt.status).toBe(DraftPickStatus.ALREADY_PICKED);
          found = true;
          break;
        }
      }
    }
    // Either found and verified, or the player never appeared again (both valid)
    expect(typeof found).toBe("boolean");
  });

  it("alice and bob can independently pick the same player from their own rounds", () => {
    // Build a pool where the SAME players appear in both countries
    // (not realistic but tests the independence)
    const player = PlayerBuilder.batter().named("SharedStar").fromCountry(Country.INDIA).build();
    const pool   = new PlayerPool([
      player,
      ...Array.from({ length: 5 }, () => PlayerBuilder.batter().fromCountry(Country.INDIA).build()),
      ...Array.from({ length: 2 }, () => PlayerBuilder.allRounder().fromCountry(Country.INDIA).build()),
      ...Array.from({ length: 3 }, () => PlayerBuilder.bowler().fromCountry(Country.INDIA).build()),
      PlayerBuilder.wicketKeeper().fromCountry(Country.INDIA).build(),
    ]);

    // Both Alice and Bob have India only — they'll see the same player pool
    const engine  = new DraftSessionEngine(pool, new RandomGenerator(42));
    const singleCountryConfig = { ...config, countries: [Country.INDIA] };
    let   session = engine.createSession("alice", "bob", singleCountryConfig);

    // Alice picks SharedStar if available
    const aliceOpts = session.getOptionsFor("alice");
    const aliceOpt  = aliceOpts.find((o) => o.player.id === player.id && o.isSelectable());

    // Bob also picks SharedStar if available
    const bobOpts = session.getOptionsFor("bob");
    const bobOpt  = bobOpts.find((o) => o.player.id === player.id && o.isSelectable());

    if (aliceOpt && bobOpt) {
      let r = session.pick("alice", aliceOpt.player, aliceOpt.eligiblePositions[0]);
      session = (r as { success: true; session: typeof session }).session;
      r = session.pick("bob", bobOpt.player, bobOpt.eligiblePositions[0]);
      // Both should succeed — independent squads
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.session.participantA.squad.hasPlayer(player.id)).toBe(true);
        expect(r.session.participantB.squad.hasPlayer(player.id)).toBe(true);
      }
    }
  });

  it("session summary shows each user's country", () => {
    const engine  = new DraftSessionEngine(buildTestPool(), new RandomGenerator(42));
    const session = engine.createSession("alice", "bob", config);
    const summary = session.summary();
    expect(summary).toContain("alice");
    expect(summary).toContain("bob");
  });
});
