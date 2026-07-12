import { describe, expect, it } from "vitest";

import { MatchBuilder } from "../../../test";

import { InningsFactory } from "./InningsFactory";

describe("InningsFactory", () => {
  it("should create the first innings", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().createFirstInnings(match);

    expect(innings.getBattingTeam()).toBe(match.getTeamA());

    expect(innings.getBowlingTeam()).toBe(match.getTeamB());

    expect(innings.getScore().getRuns()).toBe(0);

    expect(innings.getScore().getWickets()).toBe(0);

    expect(innings.getScore().getBalls()).toBe(0);
  });

  it("should create the second innings", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().createSecondInnings(match);

    expect(innings.getBattingTeam()).toBe(match.getTeamB());

    expect(innings.getBowlingTeam()).toBe(match.getTeamA());

    expect(innings.getScore().getRuns()).toBe(0);
  });

  it("should create an opening batting pair", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().createFirstInnings(match);

    expect(innings.getBattingPair()).toBeDefined();
  });

  it("should create an opening bowling spell", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().createFirstInnings(match);

    expect(innings.getBowlingSpell()).toBeDefined();
  });
});
