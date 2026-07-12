import { describe, expect, it } from "vitest";

import { MatchBuilder } from "./MatchBuilder";
import { InningsBuilder } from "./InningsBuilder";

describe("InningsBuilder", () => {
  it("should create the first innings from a match", () => {
    const match = MatchBuilder.standard().build();

    const innings = InningsBuilder.standard().forFirstInnings(match).build();

    expect(innings.getBattingTeam()).toBe(match.getTeamA());

    expect(innings.getBowlingTeam()).toBe(match.getTeamB());
  });

  it("should create the second innings from a match", () => {
    const match = MatchBuilder.standard().build();

    const innings = InningsBuilder.standard().forSecondInnings(match).build();

    expect(innings.getBattingTeam()).toBe(match.getTeamB());

    expect(innings.getBowlingTeam()).toBe(match.getTeamA());
  });
});
