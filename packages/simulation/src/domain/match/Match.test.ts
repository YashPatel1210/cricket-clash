import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../test";

import { Match } from "./Match";
import { MatchState } from "./MatchState";

describe("Match", () => {
  it("should create a match", () => {
    const match = new Match(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    expect(match).toBeDefined();
  });
  it("should expose team A", () => {
    const teamA = TeamBuilder.standard().build();

    const teamB = TeamBuilder.standard().build();

    const match = new Match(teamA, teamB);

    expect(match.getTeamA()).toBe(teamA);
  });
  it("should expose team B", () => {
    const teamA = TeamBuilder.standard().build();

    const teamB = TeamBuilder.standard().build();

    const match = new Match(teamA, teamB);

    expect(match.getTeamB()).toBe(teamB);
  });
  it("should initialize in NOT_STARTED state", () => {
    const match = new Match(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    expect(match.getState()).toBe(MatchState.NOT_STARTED);
  });
  it("should reject the same team playing itself", () => {
    const team = TeamBuilder.standard().build();

    expect(() => new Match(team, team)).toThrow(
      "A match requires two different teams.",
    );
  });
});
