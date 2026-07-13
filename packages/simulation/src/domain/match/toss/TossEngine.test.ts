import { describe, expect, it } from "vitest";

import { RandomGenerator } from "../../../infrastructure/random";
import { MatchBuilder } from "../../../test";

import { TossDecision } from "./TossDecision";
import { TossEngine } from "./TossEngine";

describe("TossEngine", () => {
  function createEngine(): TossEngine {
    return new TossEngine(new RandomGenerator(42));
  }

  it("should conduct a toss", () => {
    const match = MatchBuilder.standard().build();

    const toss = createEngine().conduct(match);

    expect(toss).toBeDefined();
  });

  it("should choose one of the match teams", () => {
    const match = MatchBuilder.standard().build();

    const toss = createEngine().conduct(match);

    expect([match.getTeamA(), match.getTeamB()]).toContain(toss.getWinner());
  });

  it("should choose a valid decision", () => {
    const toss = createEngine().conduct(MatchBuilder.standard().build());

    expect([TossDecision.BAT, TossDecision.BOWL]).toContain(toss.getDecision());
  });

  it("should be deterministic for the same seed", () => {
    const match = MatchBuilder.standard().build();

    const first = createEngine().conduct(match);

    const second = createEngine().conduct(match);

    expect(first.getWinner()).toBe(second.getWinner());

    expect(first.getDecision()).toBe(second.getDecision());
  });
});
