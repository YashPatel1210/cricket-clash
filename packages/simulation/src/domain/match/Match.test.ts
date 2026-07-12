import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../test";

import { Match } from "./Match";
import { MatchConditions } from "./conditions/MatchConditions";
import { MatchState } from "./MatchState";
import { PitchType } from "./conditions/PitchType";
import { Stadium } from "./conditions/Stadium";
import { WeatherCondition } from "./conditions/WeatherCondition";
import { MatchBuilder } from "../../test";
import { InningsBuilder } from "../../test";
import { InningsResult } from "./innings";
import { Toss } from "./toss/Toss";
import { TossDecision } from "./toss/TossDecision";

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
  it("should expose toss when available", () => {
    const team = TeamBuilder.standard().build();

    const toss = new Toss(team, TossDecision.BAT);

    const match = MatchBuilder.standard().withToss(toss).build();

    expect(match.getToss()).toBe(toss);
  });

  it("should expose first innings when available", () => {
    const innings = new InningsResult(InningsBuilder.standard().build(), []);

    const match = MatchBuilder.standard().withFirstInnings(innings).build();

    expect(match.getFirstInnings()).toBe(innings);
  });

  it("should expose second innings when available", () => {
    const innings = new InningsResult(InningsBuilder.standard().build(), []);

    const match = MatchBuilder.standard().withSecondInnings(innings).build();

    expect(match.getSecondInnings()).toBe(innings);
  });
});
