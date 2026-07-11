import { describe, expect, it } from "vitest";

import { Country } from "@cricket-clash/shared";

import { RandomGenerator } from "../../infrastructure/random";
import { PlayerBuilder, TeamBuilder } from "../../test";

import { DraftContext } from "./DraftContext";
import { PlayerPool } from "./PlayerPool";
import { DefaultCountrySelectionStrategy } from "./DefaultCountrySelectionStrategy";

describe("DefaultCountrySelectionStrategy", () => {
  it("should select a country from the player pool", () => {
    const pool = new PlayerPool([
      PlayerBuilder.batter().fromCountry(Country.INDIA).build(),

      PlayerBuilder.bowler().fromCountry(Country.AUSTRALIA).build(),
    ]);

    const context = new DraftContext(
      pool,
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const strategy = new DefaultCountrySelectionStrategy();

    const selected = strategy.select(context);

    expect(pool.countries()).toContain(selected);
  });

  it("should produce deterministic selections for the same seed", () => {
    const pool = new PlayerPool([
      PlayerBuilder.batter().fromCountry(Country.INDIA).build(),

      PlayerBuilder.bowler().fromCountry(Country.AUSTRALIA).build(),
    ]);

    const first = new DraftContext(
      pool,
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const second = new DraftContext(
      pool,
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const strategy = new DefaultCountrySelectionStrategy();

    expect(strategy.select(first)).toBe(strategy.select(second));
  });

  it("should throw when no countries are available", () => {
    const context = new DraftContext(
      new PlayerPool([]),
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const strategy = new DefaultCountrySelectionStrategy();

    expect(() => strategy.select(context)).toThrow(
      "No countries available for selection.",
    );
  });
});
