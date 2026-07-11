import { PlayerRole } from "@cricket-clash/shared";

import { DraftContext } from "./DraftContext";

export interface RoleEligibilityStrategy {
  availableRoles(context: DraftContext): ReadonlyArray<PlayerRole>;
}
