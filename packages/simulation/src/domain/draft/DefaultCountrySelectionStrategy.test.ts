import { describe, expect, it } from "vitest";

import { Country } from "@cricket-clash/shared";

import { RandomGenerator } from "../../infrastructure/random";
import { PlayerBuilder } from "../../test";
import { PlayerPool } from "./PlayerPool";
import { DefaultCountrySelectionStrategy } from "./DefaultCountrySelectionStrategy";

describe("DefaultCountrySelectionStrategy", () => {
  it("should select a country from the player pool", () => {
    const pool = new PlayerPool([
      PlayerBuilder
        .batter()
        .fromCountry(Country.INDIA)
        .build(),

      PlayerBuilder
        .bowler()
        .fromCountry(Country.AUSTRALIA)
        .build(),
    ]);

    const strategy =
      new DefaultCountrySelectionStrategy(
        new RandomGenerator(42),
      );

    const selected =
      strategy.select(pool);

    expect(pool.countries())
      .toContain(selected);
  });

  it("should produce deterministic selections for the same seed", () => {
    const pool = new PlayerPool([
      PlayerBuilder
        .batter()
        .fromCountry(Country.INDIA)
        .build(),

      PlayerBuilder
        .bowler()
        .fromCountry(Country.AUSTRALIA)
        .build(),
    ]);

    const first =
      new DefaultCountrySelectionStrategy(
        new RandomGenerator(42),
      );

    const second =
      new DefaultCountrySelectionStrategy(
        new RandomGenerator(42),
      );

    expect(
      first.select(pool),
    ).toBe(
      second.select(pool),
    );
  });

  it("should throw when no countries are available", () => {
    const strategy =
      new DefaultCountrySelectionStrategy(
        new RandomGenerator(42),
      );

    expect(() =>
      strategy.select(
        new PlayerPool([]),
      ),
    ).toThrow(
      "No countries available for selection.",
    );
  });
});