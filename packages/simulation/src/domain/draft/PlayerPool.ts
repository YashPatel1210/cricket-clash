import { Player } from "../player";
import { Country } from "@cricket-clash/shared";
import { PlayerRole } from "@cricket-clash/shared";

export class PlayerPool {
  public constructor(private readonly players: ReadonlyArray<Player>) {}

  public countries(): ReadonlyArray<Country> {
    return [...new Set(this.players.map((player) => player.country))];
  }

  public playersFromCountry(country: Country): ReadonlyArray<Player> {
    return this.players.filter((player) => player.country === country);
  }

  public size(): number {
    return this.players.length;
  }

  public isEmpty(): boolean {
    return this.players.length === 0;
  }

  public getPlayers(): ReadonlyArray<Player> {
    return this.players;
  }

  public hasPlayer(playerId: string): boolean {
    return this.players.some((player) => player.id === playerId);
  }

  public exclude(playerIds: ReadonlyArray<string>): PlayerPool {
    const filteredPlayers = this.players.filter(
      (player) => !playerIds.includes(player.id),
    );

    return new PlayerPool(filteredPlayers);
  }
  public availablePlayers(
    roles: ReadonlyArray<PlayerRole>,
    excludedPlayerIds: ReadonlyArray<string>,
  ): ReadonlyArray<Player> {
    return this.players.filter(
      (player) =>
        roles.includes(player.role) && !excludedPlayerIds.includes(player.id),
    );
  }
}
