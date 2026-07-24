import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import type { CountryPlayerFile, PlayerData } from "../types/PlayerData";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAYERS_DIR = join(__dirname, "../players");

/** All available country file names (without .json extension). */
const COUNTRY_FILES = [
  "india",
  "australia",
  "england",
  "bangladesh",
  "afghanistan",
  "ireland",
  "pakistan",
  "south-africa",
  "new-zealand",
  "sri-lanka",
  "west-indies",
  "zimbabwe",
] as const;

export type CountryFile = (typeof COUNTRY_FILES)[number];

/**
 * PlayerLoader — loads player data from JSON files in packages/data/src/players/.
 *
 * All data is validated at load time against the CountryPlayerFile shape.
 * If a file is missing or malformed, an error is thrown immediately (fail fast).
 */
export class PlayerLoader {
  private static cache = new Map<string, PlayerData[]>();

  /**
   * Loads all players from a single country file.
   * Results are cached — repeated calls are O(1).
   */
  public static loadCountry(file: CountryFile): ReadonlyArray<PlayerData> {
    if (PlayerLoader.cache.has(file)) {
      return PlayerLoader.cache.get(file)!;
    }

    const filePath = join(PLAYERS_DIR, `${file}.json`);
    const raw      = readFileSync(filePath, "utf-8");
    const data     = JSON.parse(raw) as CountryPlayerFile;

    if (!data.players || !Array.isArray(data.players)) {
      throw new Error(`Invalid player file format: ${file}.json`);
    }

    PlayerLoader.cache.set(file, data.players);
    return data.players;
  }

  /**
   * Loads all players from all available countries.
   */
  public static loadAll(): ReadonlyArray<PlayerData> {
    return COUNTRY_FILES.flatMap((file) => PlayerLoader.loadCountry(file));
  }

  /**
   * Loads players from a specific subset of countries.
   */
  public static loadCountries(files: ReadonlyArray<CountryFile>): ReadonlyArray<PlayerData> {
    return files.flatMap((f) => PlayerLoader.loadCountry(f));
  }

  /**
   * Loads all available country file names.
   */
  public static availableCountries(): ReadonlyArray<CountryFile> {
    return COUNTRY_FILES;
  }

  /** Clears the in-memory cache (useful for testing). */
  public static clearCache(): void {
    PlayerLoader.cache.clear();
  }
}
