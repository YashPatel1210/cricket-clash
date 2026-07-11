import { PlayerRole } from "@cricket-clash/shared";

import type { RoleLimit } from "./RoleLimit";

export interface TeamRules {
  maxPlayers: number;

  roleLimits: Record<PlayerRole, RoleLimit>;
}
