import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../../test";

import { Innings } from "./Innings";
import { InningsState } from "./InningsState";

describe("Innings", () => {
  it("should create an innings", () => {
    const innings = new Innings(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    expect(innings).toBeDefined();
  });

  it("should expose batting team", () => {
    const battingTeam = TeamBuilder.standard().build();

    const bowlingTeam = TeamBuilder.standard().build();

    const innings = new Innings(battingTeam, bowlingTeam);

    expect(innings.getBattingTeam()).toBe(battingTeam);
  });

  it("should expose bowling team", () => {
    const battingTeam = TeamBuilder.standard().build();

    const bowlingTeam = TeamBuilder.standard().build();

    const innings = new Innings(battingTeam, bowlingTeam);

    expect(innings.getBowlingTeam()).toBe(bowlingTeam);
  });

  it("should initialize in NOT_STARTED state", () => {
    const innings = new Innings(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    expect(innings.getState()).toBe(InningsState.NOT_STARTED);
  });

  it("should reject identical teams", () => {
    const team = TeamBuilder.standard().build();

    expect(() => new Innings(team, team)).toThrow(
      "An innings requires two different teams.",
    );
  });
});
