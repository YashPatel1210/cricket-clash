import { Country } from "@cricket-clash/shared";

import { PlayerPool } from "./PlayerPool";

export interface CountrySelectionStrategy {
  select(
    pool: PlayerPool,
  ): Country;
}