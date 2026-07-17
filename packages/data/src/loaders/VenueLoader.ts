import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import type { VenueData, VenueFile } from "../types/VenueData";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENUES_FILE = join(__dirname, "../venues/venues.json");

/**
 * VenueLoader — loads venue/stadium data from venues.json.
 */
export class VenueLoader {
  private static cache: VenueData[] | null = null;

  /** Loads all venues. Results are cached. */
  public static loadAll(): ReadonlyArray<VenueData> {
    if (VenueLoader.cache) return VenueLoader.cache;

    const raw  = readFileSync(VENUES_FILE, "utf-8");
    const data = JSON.parse(raw) as VenueFile;

    if (!data.venues || !Array.isArray(data.venues)) {
      throw new Error("Invalid venues.json format");
    }

    VenueLoader.cache = data.venues;
    return data.venues;
  }

  /** Finds a venue by ID. */
  public static findById(id: string): VenueData | undefined {
    return VenueLoader.loadAll().find((v) => v.id === id);
  }

  /** Finds all venues in a specific country. */
  public static findByCountry(country: string): ReadonlyArray<VenueData> {
    return VenueLoader.loadAll().filter((v) => v.country === country);
  }

  public static clearCache(): void {
    VenueLoader.cache = null;
  }
}
