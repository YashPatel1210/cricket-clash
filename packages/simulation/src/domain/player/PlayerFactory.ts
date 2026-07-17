import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import type { PlayerData } from "@cricket-clash/data";

import { Player } from "./Player";

/**
 * PlayerFactory — converts raw PlayerData (from @cricket-clash/data)
 * to domain Player objects.
 *
 * PlayerData is the JSON-serialisable shape; Player is the domain object
 * with behaviour. This factory is the single seam between data and domain.
 */
export class PlayerFactory {
  public static fromData(data: PlayerData): Player {
    return new Player(
      data.id,
      data.name,
      data.country as Country,
      data.role    as PlayerRole,
      data.handedness === "LEFT" ? Handedness.LEFT : Handedness.RIGHT,
      data.battingStyle === "LEFT_HAND" ? BattingStyle.LEFT_HAND : BattingStyle.RIGHT_HAND,
      PlayerFactory.parseBowlingStyle(data.bowlingStyle),
      data.dna,
    );
  }

  public static fromDataList(dataList: ReadonlyArray<PlayerData>): Player[] {
    return dataList.map((d) => PlayerFactory.fromData(d));
  }

  private static parseBowlingStyle(raw: string | null): BowlingStyle | null {
    if (!raw) return null;

    const map: Record<string, BowlingStyle> = {
      "Right Arm Fast":       BowlingStyle.RIGHT_ARM_FAST,
      "Right Arm Medium":     BowlingStyle.RIGHT_ARM_MEDIUM,
      "Left Arm Fast":        BowlingStyle.LEFT_ARM_FAST,
      "Left Arm Medium":      BowlingStyle.LEFT_ARM_MEDIUM,
      "Right Arm Off Spin":   BowlingStyle.RIGHT_ARM_OFF_SPIN,
      "Right Arm Leg Spin":   BowlingStyle.RIGHT_ARM_LEG_SPIN,
      "Left Arm Orthodox":    BowlingStyle.LEFT_ARM_ORTHODOX,
      "Left Arm Wrist Spin":  BowlingStyle.LEFT_ARM_WRIST_SPIN,
    };

    const style = map[raw];
    if (!style) {
      throw new Error(`Unknown bowling style in data: "${raw}"`);
    }
    return style;
  }
}
