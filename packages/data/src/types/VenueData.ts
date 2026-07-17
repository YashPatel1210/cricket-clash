/**
 * One venue / stadium entry as stored in venues.json.
 */
export interface VenueData {
  id:           string;
  name:         string;
  city:         string;
  /** Matches Country enum value */
  country:      string;
  /** Matches BoundarySize enum */
  boundarySize: "SMALL" | "MEDIUM" | "LARGE";
  /** Matches PitchType enum — the typical pitch character at this venue */
  typicalPitch: "FLAT" | "GREEN" | "DUSTY" | "DRY";
  /** Metres above sea level — higher = ball carries further */
  altitude?:    number;
  /** Crowd capacity */
  capacity?:    number;
  knownFor?:    string;
}

/**
 * Shape of venues.json
 */
export interface VenueFile {
  version: string;
  venues:  VenueData[];
}
