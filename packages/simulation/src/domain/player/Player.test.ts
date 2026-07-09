import { describe, expect, it } from "vitest";

import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { Player } from "./Player";

describe("Player", () => {
  it("should create an immutable player", () => {
    const player = new Player(
      "virat-kohli",
      "Virat Kohli",
      Country.INDIA,
      PlayerRole.BATTER,
      Handedness.RIGHT,
      BattingStyle.RIGHT_HAND,
      BowlingStyle.RIGHT_ARM_MEDIUM,
      {
        batting: 96,
        bowling: 35,
        fielding: 90,
        fitness: 92,
        experience: 98,
      }
    );

    expect(player.name).toBe("Virat Kohli");
    expect(player.country).toBe(Country.INDIA);
    expect(player.role).toBe(PlayerRole.BATTER);
    expect(player.attributes.batting).toBe(96);
  });
});