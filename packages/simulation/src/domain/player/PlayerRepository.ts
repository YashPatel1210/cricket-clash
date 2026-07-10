import { Country, PlayerRole } from "@cricket-clash/shared";

import { Player } from "./Player";

export interface PlayerRepository {
  getAll(): ReadonlyArray<Player>;

  findById(id: string): Player | undefined;

  findByCountry(
    country: Country,
  ): ReadonlyArray<Player>;

  findByRole(
    role: PlayerRole,
  ): ReadonlyArray<Player>;
}