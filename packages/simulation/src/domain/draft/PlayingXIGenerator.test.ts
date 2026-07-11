import { describe, expect, it } from "vitest";

import { Country } from "@cricket-clash/shared";

import { PlayerBuilder } from "../../test";
import { PlayingXIGenerator } from "./PlayingXIGenerator";

describe("PlayingXIGenerator", () => {
  it("should generate a playing xi", () => {
    const players = Array.from(
      { length: 11 },
      (_, index) =>
        PlayerBuilder
          .batter()
          .named(`Player ${index + 1}`)
          .fromCountry(Country.INDIA)
          .build(),
    );

    const generator = new PlayingXIGenerator();

    const xi = generator.generate(players);

    expect(xi.playerCount()).toBe(11);
  });

  it("should throw when fewer than eleven players are provided", () => {
    const players = Array.from(
      { length: 10 },
      (_, index) =>
        PlayerBuilder
          .batter()
          .named(`Player ${index + 1}`)
          .fromCountry(Country.INDIA)
          .build(),
    );

    const generator = new PlayingXIGenerator();

    expect(() =>
      generator.generate(players),
    ).toThrow(
      "At least 11 players are required.",
    );
  });

  it("should preserve player order", () => {
    const players = Array.from(
      { length: 11 },
      (_, index) =>
        PlayerBuilder
          .batter()
          .named(`Player ${index + 1}`)
          .fromCountry(Country.INDIA)
          .build(),
    );

    const generator = new PlayingXIGenerator();

    const xi = generator.generate(players);

    expect(
      xi.getPlayers()[0].name,
    ).toBe("Player 1");

    expect(
      xi.getPlayers()[10].name,
    ).toBe("Player 11");
  });

  it("should only use the first eleven players", () => {
    const players = Array.from(
      { length: 15 },
      (_, index) =>
        PlayerBuilder
          .batter()
          .named(`Player ${index + 1}`)
          .fromCountry(Country.INDIA)
          .build(),
    );

    const generator = new PlayingXIGenerator();

    const xi = generator.generate(players);

    expect(xi.playerCount()).toBe(11);

    expect(
      xi.getPlayers()[10].name,
    ).toBe("Player 11");

    expect(
      xi.hasPlayer(players[11].id),
    ).toBe(false);
  });
});