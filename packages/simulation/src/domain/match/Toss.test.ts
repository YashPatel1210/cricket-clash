import { describe, expect, it } from "vitest";

import { MatchBuilder, TeamBuilder } from "../../test";

import { Toss } from "./Toss";
import { TossDecision } from "./TossDecision";

describe("Toss", () => {
  it("should expose toss winner", () => {
    // Arrange

    const winner = TeamBuilder.standard().build();

    const toss = new Toss(winner, TossDecision.BAT);

    // Assert

    expect(toss.getWinner()).toBe(winner);
  });

  it("should expose toss decision", () => {
    // Arrange

    const toss = new Toss(TeamBuilder.standard().build(), TossDecision.BOWL);

    // Assert

    expect(toss.getDecision()).toBe(TossDecision.BOWL);
  });

  it("should indicate batting decision", () => {
    // Arrange

    const toss = new Toss(TeamBuilder.standard().build(), TossDecision.BAT);

    // Assert

    expect(toss.electedToBat()).toBe(true);

    expect(toss.electedToBowl()).toBe(false);
  });

  it("should indicate bowling decision", () => {
    // Arrange

    const toss = new Toss(TeamBuilder.standard().build(), TossDecision.BOWL);

    // Assert

    expect(toss.electedToBowl()).toBe(true);

    expect(toss.electedToBat()).toBe(false);
  });
});
