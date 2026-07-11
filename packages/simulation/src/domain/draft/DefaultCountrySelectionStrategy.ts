import { Country } from "@cricket-clash/shared";

import { RandomGenerator } from "../../infrastructure/random";
import { PlayerPool } from "./PlayerPool";
import { CountrySelectionStrategy } from "./CountrySelectionStrategy";

export class DefaultCountrySelectionStrategy
  implements CountrySelectionStrategy {

  public constructor(
    private readonly random: RandomGenerator,
  ) {}

  public select(
    pool: PlayerPool,
  ): Country {

    const countries = pool.countries();

    if (countries.length === 0) {
      throw new Error(
        "No countries available for selection.",
      );
    }

    return this.random.pick(countries);
  }
}