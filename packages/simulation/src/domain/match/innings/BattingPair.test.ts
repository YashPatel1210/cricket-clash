import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../../test";

import { BattingPair } from "./BattingPair";

describe("BattingPair", () => {
  it("should create a batting pair", () => {
    const pair = new BattingPair(
      PlayerBuilder.batter().build(),
      PlayerBuilder.batter().build(),
    );

    expect(pair).toBeDefined();
  });

  it("should expose striker", () => {
    const striker = PlayerBuilder.batter().build();

    const nonStriker = PlayerBuilder.batter().build();

    const pair = new BattingPair(striker, nonStriker);

    expect(pair.getStriker()).toBe(striker);
  });

  it("should expose non striker", () => {
    const striker = PlayerBuilder.batter().build();

    const nonStriker = PlayerBuilder.batter().build();

    const pair = new BattingPair(striker, nonStriker);

    expect(pair.getNonStriker()).toBe(nonStriker);
  });

  it("should reject the same player", () => {
    const batter = PlayerBuilder.batter().build();

    expect(() => new BattingPair(batter, batter)).toThrow(
      "Striker and non-striker must be different players.",
    );
  });

  it("should swap strike", () => {
    const striker = PlayerBuilder.batter().build();

    const nonStriker = PlayerBuilder.batter().build();

    const pair = new BattingPair(striker, nonStriker);

    const swapped = pair.swapStrike();

    expect(swapped.getStriker()).toBe(nonStriker);

    expect(swapped.getNonStriker()).toBe(striker);
  });
});
