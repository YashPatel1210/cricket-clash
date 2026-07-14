import { describe, expect, it } from "vitest";

import { InningsBuilder, PlayerBuilder, TeamBuilder } from "../../../test";

import { Score } from "../score";
import { BattingOrder } from "./BattingOrder";
import { BattingPair } from "./BattingPair";
import { BowlingSpell } from "./BowlingSpell";
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

  describe("immutable transitions", () => {
    it("should return a new innings with updated score", () => {
      const innings = InningsBuilder.standard().build();

      const score = new Score(50, 2, 36);

      const updated = innings.withScore(score);

      expect(updated).not.toBe(innings);
      expect(updated.getScore()).toBe(score);
      expect(innings.getScore()).not.toBe(score);
    });

    it("should return a new innings with updated batting pair", () => {
      const innings = InningsBuilder.standard().build();

      const pair = new BattingPair(
        PlayerBuilder.batter().build(),
        PlayerBuilder.batter().build(),
      );

      const updated = innings.withBattingPair(pair);

      expect(updated).not.toBe(innings);
      expect(updated.getBattingPair()).toBe(pair);
      expect(innings.getBattingPair()).not.toBe(pair);
    });

    it("should return a new innings with updated bowling spell", () => {
      const innings = InningsBuilder.standard().build();

      const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 6);

      const updated = innings.withBowlingSpell(spell);

      expect(updated).not.toBe(innings);
      expect(updated.getBowlingSpell()).toBe(spell);
      expect(innings.getBowlingSpell()).not.toBe(spell);
    });

    it("should return a new innings with updated batting order", () => {
      const innings = InningsBuilder.standard().build();

      const order = new BattingOrder([PlayerBuilder.batter().build()]);

      const updated = innings.withBattingOrder(order);

      expect(updated).not.toBe(innings);
      expect(updated.getBattingOrder()).toBe(order);
      expect(innings.getBattingOrder()).not.toBe(order);
    });
  });
});
