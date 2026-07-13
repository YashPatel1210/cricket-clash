import { describe, expect, it } from "vitest";

import { MatchBuilder } from "../../test";

import { MatchOrderResolver } from "./MatchOrderResolver";

import { Toss } from "./toss/Toss";
import { TossDecision } from "./toss/TossDecision";

describe("MatchOrderResolver", () => {
  function createResolver(): MatchOrderResolver {
    return new MatchOrderResolver();
  }

  it("should resolve when team A bats", () => {
    const match = MatchBuilder.standard().build();

    const order = createResolver().resolve(
      match,
      new Toss(match.getTeamA(), TossDecision.BAT),
    );

    expect(order.getFirstInnings().getBattingTeam()).toBe(match.getTeamA());

    expect(order.getSecondInnings().getBattingTeam()).toBe(match.getTeamB());
  });

  it("should resolve when team A bowls", () => {
    const match = MatchBuilder.standard().build();

    const order = createResolver().resolve(
      match,
      new Toss(match.getTeamA(), TossDecision.BOWL),
    );

    expect(order.getFirstInnings().getBattingTeam()).toBe(match.getTeamB());

    expect(order.getSecondInnings().getBattingTeam()).toBe(match.getTeamA());
  });

  it("should resolve when team B bats", () => {
    const match = MatchBuilder.standard().build();

    const order = createResolver().resolve(
      match,
      new Toss(match.getTeamB(), TossDecision.BAT),
    );

    expect(order.getFirstInnings().getBattingTeam()).toBe(match.getTeamB());

    expect(order.getSecondInnings().getBattingTeam()).toBe(match.getTeamA());
  });

  it("should resolve when team B bowls", () => {
    const match = MatchBuilder.standard().build();

    const order = createResolver().resolve(
      match,
      new Toss(match.getTeamB(), TossDecision.BOWL),
    );

    expect(order.getFirstInnings().getBattingTeam()).toBe(match.getTeamA());

    expect(order.getSecondInnings().getBattingTeam()).toBe(match.getTeamB());
  });
});
