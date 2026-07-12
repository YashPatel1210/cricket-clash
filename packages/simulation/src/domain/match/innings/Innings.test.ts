import { describe, expect, it } from "vitest";

import { InningsBuilder, PlayerBuilder, TeamBuilder } from "../../../test";

import { Score } from "../score";
import { BattingPair } from "./BattingPair";
import { BowlingSpell } from "./BowlingSpell";
import { BattingOrder } from "./BattingOrder";
import { InningsState } from "./InningsState";

describe("Innings", () => {
  it("should create an innings", () => {
    const innings = InningsBuilder.standard().build();

    expect(innings).toBeDefined();
  });

  it("should expose batting team", () => {
    const battingTeam = TeamBuilder.standard().build();

    const innings = InningsBuilder.standard()
      .withBattingTeam(battingTeam)
      .build();

    expect(innings.getBattingTeam()).toBe(battingTeam);
  });

  it("should expose bowling team", () => {
    const bowlingTeam = TeamBuilder.standard().build();

    const innings = InningsBuilder.standard()
      .withBowlingTeam(bowlingTeam)
      .build();

    expect(innings.getBowlingTeam()).toBe(bowlingTeam);
  });

  it("should initialize in NOT_STARTED state", () => {
    const innings = InningsBuilder.standard().build();

    expect(innings.getState()).toBe(InningsState.NOT_STARTED);
  });

  it("should reject identical teams", () => {
    const team = TeamBuilder.standard().build();

    expect(() =>
      InningsBuilder.standard()
        .withBattingTeam(team)
        .withBowlingTeam(team)
        .build(),
    ).toThrow("An innings requires two different teams.");
  });

  it("should expose score", () => {
    const score = new Score(120, 3, 84);

    const innings = InningsBuilder.standard().withScore(score).build();

    expect(innings.getScore()).toBe(score);
  });

  it("should expose batting pair", () => {
    const pair = new BattingPair(
      PlayerBuilder.batter().build(),
      PlayerBuilder.batter().build(),
    );

    const innings = InningsBuilder.standard().withBattingPair(pair).build();

    expect(innings.getBattingPair()).toBe(pair);

    expect(innings.getBattingPair().getStriker()).toBe(pair.getStriker());

    expect(innings.getBattingPair().getNonStriker()).toBe(pair.getNonStriker());
  });

  it("should expose bowling spell", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 18);

    const innings = InningsBuilder.standard().withBowlingSpell(spell).build();

    expect(innings.getBowlingSpell()).toBe(spell);
  });
  it("should expose batting order", () => {
    const order = new BattingOrder([PlayerBuilder.batter().build()]);

    const innings = InningsBuilder.standard().withBattingOrder(order).build();

    expect(innings.getBattingOrder()).toBe(order);
  });
});
