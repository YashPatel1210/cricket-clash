import { describe, expect, it } from "vitest";

import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { Player } from "./Player";
import { PlayerInstance } from "./PlayerInstance";

describe("PlayerInstance", () => {
  function createPlayer(): Player {
    return new Player(
      "virat-kohli",
      "Virat Kohli",
      Country.INDIA,
      PlayerRole.BATTER,
      Handedness.RIGHT,
      BattingStyle.RIGHT_HAND,
      BowlingStyle.RIGHT_ARM_MEDIUM,
      {
        batting: 95,
        bowling: 20,
        fielding: 90,
        fitness: 95,
        experience: 99,
      },
    );
  }

  it("should wrap a player", () => {
    const player = createPlayer();

    const instance = new PlayerInstance(player);

    expect(instance.getPlayer()).toBe(player);
  });

  it("should expose the player id", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getId()).toBe("virat-kohli");
  });

  it("should expose the player name", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getName()).toBe("Virat Kohli");
  });

  it("should expose the player role", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getRole()).toBe(PlayerRole.BATTER);
  });

  it("should expose the player country", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getCountry()).toBe(Country.INDIA);
  });

  it("should expose the handedness", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getHandedness()).toBe(Handedness.RIGHT);
  });

  it("should expose the batting style", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getBattingStyle()).toBe(BattingStyle.RIGHT_HAND);
  });

  it("should expose the bowling style", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getBowlingStyle()).toBe(BowlingStyle.RIGHT_ARM_MEDIUM);
  });

  it("should expose player attributes", () => {
    const instance = new PlayerInstance(createPlayer());

    expect(instance.getAttributes()).toEqual({
      batting: 95,
      bowling: 20,
      fielding: 90,
      fitness: 95,
      experience: 99,
    });
  });

  it("should remain immutable", () => {
    const player = createPlayer();

    const instance = new PlayerInstance(player);

    expect(instance.getPlayer()).toBe(player);
    expect(instance.getId()).toBe(player.id);
    expect(instance.getName()).toBe(player.name);
  });
});
