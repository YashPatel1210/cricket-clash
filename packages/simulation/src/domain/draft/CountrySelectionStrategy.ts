import { Country } from "@cricket-clash/shared";

import { DraftContext } from "./DraftContext";

export interface CountrySelectionStrategy {
  select(context: DraftContext): Country;
}
