import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import type { PlayerAttributes } from "./PlayerAttributes";

export class Player {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly country: Country,
    public readonly role: PlayerRole,
    public readonly handedness: Handedness,
    public readonly battingStyle: BattingStyle,
    public readonly bowlingStyle: BowlingStyle | null,
    public readonly attributes: PlayerAttributes,
    public readonly imageUrl?: string,
  ) {}
}
