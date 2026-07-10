import { Country, PlayerRole } from "@cricket-clash/shared";

import { Player } from "./Player";
import { PlayerRepository } from "./PlayerRepository";

export class InMemoryPlayerRepository
  implements PlayerRepository {

  public constructor(
    private readonly players: ReadonlyArray<Player>,
  ) {}

  public getAll(): ReadonlyArray<Player> {
    return this.players;
  }

  public findById(
    id: string,
  ): Player | undefined {
    return this.players.find(
      player => player.id === id,
    );
  }

  public findByCountry(
    country: Country,
  ): ReadonlyArray<Player> {
    return this.players.filter(
      player => player.country === country,
    );
  }

  public findByRole(
    role: PlayerRole,
  ): ReadonlyArray<Player> {
    return this.players.filter(
      player => player.role === role,
    );
  }
}