import { Country } from "@cricket-clash/shared";

import { DraftContext } from "./DraftContext";
import { CountrySelectionStrategy } from "./CountrySelectionStrategy";

export class DefaultCountrySelectionStrategy implements CountrySelectionStrategy {
  public select(context: DraftContext): Country {
    const countries = context.getPlayerPool().countries();

    if (countries.length === 0) {
      throw new Error("No countries available for selection.");
    }

    return context.getRandom().pick(countries);
  }
}
