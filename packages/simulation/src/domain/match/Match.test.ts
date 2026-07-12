import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../test";

import { Match } from "./Match";
import { MatchConditions } from "./conditions/MatchConditions";
import { MatchState } from "./MatchState";
import { PitchType } from "./conditions/PitchType";
import { Stadium } from "./conditions/Stadium";
import { WeatherCondition } from "./conditions/WeatherCondition";
import { MatchBuilder } from "../../test";

describe("Match", () => {
  function createConditions(): MatchConditions {
    return new MatchConditions(
      PitchType.GREEN,
      WeatherCondition.SUNNY,
      new Stadium("MCG"),
    );
  }

  it("should create a match", () => {
    const match = MatchBuilder.standard().build();

    expect(match).toBeDefined();
  });

  it("should expose team A", () => {
    const teamA = TeamBuilder.standard().build();
    const teamB = TeamBuilder.standard().build();

    const match = MatchBuilder.standard()
      .withTeamA(teamA)
      .withTeamB(teamB)
      .build();

    expect(match.getTeamA()).toBe(teamA);
  });

  it("should expose team B", () => {
    const teamA = TeamBuilder.standard().build();
    const teamB = TeamBuilder.standard().build();

    const match = new Match(teamA, teamB, createConditions());

    expect(match.getTeamB()).toBe(teamB);
  });

  it("should initialize in NOT_STARTED state", () => {
    const match = new Match(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
      createConditions(),
    );

    expect(match.getState()).toBe(MatchState.NOT_STARTED);
  });

  it("should reject the same team playing itself", () => {
    const team = TeamBuilder.standard().build();

    expect(() => new Match(team, team, createConditions())).toThrow(
      "A match requires two different teams.",
    );
  });

  it("should expose match conditions", () => {
    const conditions = new MatchConditions(
      PitchType.DRY,
      WeatherCondition.CLOUDY,
      new Stadium("Narendra Modi Stadium"),
    );

    const match = MatchBuilder.standard().withConditions(conditions).build();

    expect(match.getConditions()).toBe(conditions);
  });

  it("should preserve pitch type", () => {
    const match = new Match(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
      createConditions(),
    );

    expect(match.getConditions().getPitch()).toBe(PitchType.GREEN);
  });

  it("should preserve weather", () => {
    const match = new Match(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
      createConditions(),
    );

    expect(match.getConditions().getWeather()).toBe(WeatherCondition.SUNNY);
  });

  it("should preserve stadium", () => {
    const match = new Match(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
      createConditions(),
    );

    expect(match.getConditions().getStadium().getName()).toBe("MCG");
  });
});
