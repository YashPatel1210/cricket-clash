import { describe, expect, it } from "vitest";

import { InningsBuilder, PlayerBuilder, TeamBuilder } from "../../../test";

import { Score } from "../score";
import { BattingOrder } from "./BattingOrder";
import { BattingPair } from "./BattingPair";
import { BowlingAttack } from "./BowlingAttack";
import { BowlingOrder } from "./BowlingOrder";
import { InningsState } from "./InningsState";

describe("Innings", () => {
  it("should create an innings", () => {
    const innings = InningsBuilder.standard().build();
    expect(innings).toBeDefined();
  });

  it("should expose batting team", () => {
    const battingTeam = TeamBuilder.standard().build();
    const innings = InningsBuilder.standard().withBattingTeam(battingTeam).build();
    expect(innings.getBattingTeam()).toBe(battingTeam);
  });

  it("should expose bowling team", () => {
    const bowlingTeam = TeamBuilder.standard().build();
    const innings = InningsBuilder.standard().withBowlingTeam(bowlingTeam).build();
    expect(innings.getBowlingTeam()).toBe(bowlingTeam);
  });

  it("should initialize in NOT_STARTED state", () => {
    const innings = InningsBuilder.standard().build();
    expect(innings.getState()).toBe(InningsState.NOT_STARTED);
  });

  it("should reject identical teams", () => {
    const team = TeamBuilder.standard().build();
    expect(() =>
      InningsBuilder.standard().withBattingTeam(team).withBowlingTeam(team).build(),
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

  it("should expose bowling spell via the current attack spell", () => {
    const bowler = PlayerBuilder.bowler().build();
    const innings = InningsBuilder.standard().withBowler(bowler).build();
    expect(innings.getBowlingSpell().getBowler()).toBe(bowler);
  });

  it("should expose batting order", () => {
    const order = new BattingOrder([PlayerBuilder.batter().build()]);
    const innings = InningsBuilder.standard().withBattingOrder(order).build();
    expect(innings.getBattingOrder()).toBe(order);
  });

  it("should expose initial empty statistics", () => {
    const innings = InningsBuilder.standard().build();
    expect(innings.getStatistics()).toBeDefined();
    expect(innings.getStatistics().getAllBatterRecords()).toHaveLength(0);
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

    it("should return a new innings with updated bowling attack", () => {
      const innings = InningsBuilder.standard().build();
      const bowler = PlayerBuilder.bowler().build();
      const attack = BowlingAttack.create(new BowlingOrder([bowler]), 24);
      const updated = innings.withBowlingAttack(attack);
      expect(updated).not.toBe(innings);
      expect(updated.getBowlingSpell().getBowler()).toBe(bowler);
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
