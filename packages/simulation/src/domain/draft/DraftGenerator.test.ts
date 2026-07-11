import { describe, expect, it } from "vitest";

import { Country, PlayerRole } from "@cricket-clash/shared";

import { PlayerBuilder, TeamBuilder } from "../../test";

import { PlayerPool } from "./PlayerPool";
import { DraftContext } from "./DraftContext";
import { DraftGenerator } from "./DraftGenerator";
import { RandomGenerator } from "../../infrastructure/random";
import { DefaultCountrySelectionStrategy } from "./DefaultCountrySelectionStrategy";
import { DefaultRoleEligibilityStrategy } from "./DefaultRoleEligibilityStrategy";

describe("DraftGenerator", () => {
  it("should generate one player", () => {
    // Arrange

    const players = Array.from({ length: 20 }, (_, index) =>
      PlayerBuilder.batter()
        .named(`Player ${index + 1}`)
        .fromCountry(Country.INDIA)
        .build(),
    );

    const pool = new PlayerPool(players);

    const team = TeamBuilder.standard().build();

    const context = new DraftContext(pool, team, new RandomGenerator(42));

    const generator = new DraftGenerator(
      new DefaultCountrySelectionStrategy(),
      new DefaultRoleEligibilityStrategy(),
    );

    // Act

    const generatedTeam = generator.generate(context);

    // Assert

    expect(generatedTeam.playerCount()).toBe(1);
  });

  it("should generate one player", () => {
    // Arrange
    const players = [
      PlayerBuilder.batter().fromCountry(Country.INDIA).build(),
      PlayerBuilder.bowler().fromCountry(Country.INDIA).build(),
      PlayerBuilder.allRounder().fromCountry(Country.INDIA).build(),
      PlayerBuilder.wicketKeeper().fromCountry(Country.INDIA).build(),
    ];

    const context = new DraftContext(
      new PlayerPool(players),
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const generator = new DraftGenerator(
      new DefaultCountrySelectionStrategy(),
      new DefaultRoleEligibilityStrategy(),
    );

    // Act
    const team = generator.generate(context);

    // Assert
    expect(team.playerCount()).toBe(1);
  });
});
