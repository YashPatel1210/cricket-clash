import { Country, PlayerRole } from "@cricket-clash/shared";

import { RandomGenerator } from "../../infrastructure/random";
import { Player } from "../player";

import { PlayerPool } from "./PlayerPool";
import { RoundComposition, ROUND_COMPOSITION_TEMPLATES } from "./RoundComposition";

/**
 * A single draft round: 11 players from one country with a balanced composition.
 */
export class DraftRound {
  public constructor(
    public readonly roundNumber: number,
    public readonly country: Country,
    public readonly composition: RoundComposition,
    public readonly players: ReadonlyArray<Player>,
  ) {}
}

/**
 * DraftRoundGenerator — produces balanced, varied draft rounds from a player pool.
 *
 * Each round:
 *   1. Selects a country from the pool
 *   2. Picks a random composition template
 *   3. Fills each role slot from that country's players (randomly)
 *
 * If a country doesn't have enough players of a specific role, falls back
 * to other roles to maintain 11 players per round.
 */
export class DraftRoundGenerator {
  public constructor(private readonly random: RandomGenerator) {}

  public generateRounds(
    pool: PlayerPool,
    countries: ReadonlyArray<Country>,
    totalRounds: number,
  ): ReadonlyArray<DraftRound> {
    const rounds: DraftRound[] = [];
    const countryQueue = this.buildCountryQueue(countries, totalRounds);

    for (let i = 0; i < totalRounds; i++) {
      const country    = countryQueue[i];
      const players    = pool.playersFromCountry(country);
      const composition = this.pickComposition();
      const selected   = this.selectPlayers(players, composition);

      rounds.push(new DraftRound(i + 1, country, composition, selected));
    }

    return rounds;
  }

  /** Pick a random composition template */
  private pickComposition(): RoundComposition {
    const idx = Math.floor(this.random.nextFloat() * ROUND_COMPOSITION_TEMPLATES.length);
    return ROUND_COMPOSITION_TEMPLATES[idx];
  }

  /**
   * Build a repeating, shuffled sequence of countries covering all rounds.
   * Countries cycle so each appears roughly equally. First pass is shuffled,
   * subsequent passes are re-shuffled to add variety.
   */
  private buildCountryQueue(
    countries: ReadonlyArray<Country>,
    totalRounds: number,
  ): ReadonlyArray<Country> {
    const queue: Country[] = [];
    while (queue.length < totalRounds) {
      const shuffled = this.shuffle([...countries]);
      queue.push(...shuffled);
    }
    return queue.slice(0, totalRounds);
  }

  /**
   * Selects players for a round matching the composition.
   *
   * Strategy:
   * 1. Shuffle all players from the country
   * 2. Fill each role slot in order
   * 3. If a role has too few players, borrow from adjacent roles
   */
  private selectPlayers(
    countryPlayers: ReadonlyArray<Player>,
    composition: RoundComposition,
  ): ReadonlyArray<Player> {
    const shuffled = this.shuffle([...countryPlayers]);
    const selected: Player[] = [];
    const usedIds = new Set<string>();

    const pickRole = (roleStr: string, count: number): void => {
      let picked = 0;
      for (const player of shuffled) {
        if (picked >= count) break;
        if (usedIds.has(player.id)) continue;
        if ((player.role as string) === roleStr) {
          selected.push(player);
          usedIds.add(player.id);
          picked++;
        }
      }
      // Fallback if not enough of this exact role
      if (picked < count) {
        for (const player of shuffled) {
          if (picked >= count) break;
          if (!usedIds.has(player.id)) {
            selected.push(player);
            usedIds.add(player.id);
            picked++;
          }
        }
      }
    };

    // Fill in role order — use literal strings (not enum refs) to avoid ESM init issues
    pickRole("WICKET_KEEPER", composition.wicketKeepers);
    pickRole("BATTER",        composition.batters);
    pickRole("ALL_ROUNDER",   composition.allRounders);
    pickRole("BOWLER",        composition.bowlers);
          if (!usedIds.has(player.id)) {
            selected.push(player);
            usedIds.add(player.id);
            picked++;
          }
        }
      }
    };

    // Fill in this order: WK first (1-2, specific), then Batters, ARs, Bowlers
    pickRole(PlayerRole.WICKET_KEEPER, composition.wicketKeepers);
    pickRole(PlayerRole.BATTER,        composition.batters);
    pickRole(PlayerRole.ALL_ROUNDER,   composition.allRounders);
    pickRole(PlayerRole.BOWLER,        composition.bowlers);

    // Pad to 11 if still short
    for (const player of shuffled) {
      if (selected.length >= 11) break;
      if (!usedIds.has(player.id)) {
        selected.push(player);
        usedIds.add(player.id);
      }
    }

    return selected.slice(0, 11);
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.random.nextFloat() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
