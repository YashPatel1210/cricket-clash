import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname  = dirname(fileURLToPath(import.meta.url));
const PROFILES_DIR = join(__dirname, "../profiles");

/**
 * ProfileLoader — loads simulation tuning profiles from JSON files.
 *
 * Profiles are stored in packages/data/src/profiles/*.json and map
 * directly to the SimulationConfig interface in @cricket-clash/simulation.
 *
 * The returned object is typed as `Record<string, unknown>` here to avoid
 * a circular package dependency. In @cricket-clash/simulation, cast it:
 *
 *   import { ProfileLoader } from "@cricket-clash/data";
 *   const config = ProfileLoader.load("t20-standard") as SimulationConfig;
 */
export class ProfileLoader {
  private static cache = new Map<string, Record<string, unknown>>();

  /**
   * Loads a named profile. Returns the raw JSON as a plain object.
   * Cast to SimulationConfig in the consuming package.
   *
   * @param name — profile file name without .json extension (e.g. "t20-standard")
   */
  public static load(name: string): Record<string, unknown> {
    if (ProfileLoader.cache.has(name)) {
      return ProfileLoader.cache.get(name)!;
    }

    const filePath = join(PROFILES_DIR, `${name}.json`);
    const raw      = readFileSync(filePath, "utf-8");
    const parsed   = JSON.parse(raw) as Record<string, unknown>;

    ProfileLoader.cache.set(name, parsed);
    return parsed;
  }

  /** Convenience shortcut for the standard T20 profile. */
  public static loadT20Standard(): Record<string, unknown> {
    return ProfileLoader.load("t20-standard");
  }

  /** Lists all available profile names (without .json). */
  public static availableProfiles(): ReadonlyArray<string> {
    return ["t20-standard"];
  }

  public static clearCache(): void {
    ProfileLoader.cache.clear();
  }
}
