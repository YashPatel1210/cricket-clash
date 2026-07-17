import type { VenueData } from "@cricket-clash/data";

import { Stadium } from "../match/conditions/Stadium";
import { BoundarySize } from "../match/conditions/BoundarySize";
import { PitchType } from "../match/conditions/PitchType";

/**
 * VenueFactory — converts raw VenueData to domain Stadium + PitchType.
 */
export class VenueFactory {
  public static toStadium(data: VenueData): Stadium {
    const size = data.boundarySize as BoundarySize;
    return new Stadium(data.name, size);
  }

  public static toTypicalPitch(data: VenueData): PitchType {
    return data.typicalPitch as PitchType;
  }

  /** Finds a venue by ID from a list and converts it. Returns undefined if not found. */
  public static findAndConvert(
    venues: ReadonlyArray<VenueData>,
    id: string,
  ): { stadium: Stadium; pitch: PitchType } | undefined {
    const venue = venues.find((v) => v.id === id);
    if (!venue) return undefined;
    return {
      stadium: VenueFactory.toStadium(venue),
      pitch:   VenueFactory.toTypicalPitch(venue),
    };
  }
}
