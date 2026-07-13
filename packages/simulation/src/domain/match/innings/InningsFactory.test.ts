import { describe, expect, it } from "vitest";

import { MatchBuilder } from "../../../test";

import { InningsFactory } from "./InningsFactory";
import { InningsOrder } from "../InningsOrder";

describe("InningsFactory", () => {
  it("should create an innings", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().create(
      new InningsOrder(match.getTeamA(), match.getTeamB()),
    );

    expect(innings.getBattingTeam()).toBe(match.getTeamA());

    expect(innings.getBowlingTeam()).toBe(match.getTeamB());
  });
  it("should support reversed innings", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().create(
      new InningsOrder(match.getTeamB(), match.getTeamA()),
    );

    expect(innings.getBattingTeam()).toBe(match.getTeamB());

    expect(innings.getBowlingTeam()).toBe(match.getTeamA());
  });
  it("should create an opening pair", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().create(
      new InningsOrder(match.getTeamA(), match.getTeamB()),
    );

    expect(innings.getBattingPair()).toBeDefined();
  });
  it("should create an opening bowler", () => {
    const match = MatchBuilder.standard().build();

    const innings = new InningsFactory().create(
      new InningsOrder(match.getTeamA(), match.getTeamB()),
    );

    expect(innings.getBowlingAttack().getCurrentSpell()).toBeDefined();
  });
});
