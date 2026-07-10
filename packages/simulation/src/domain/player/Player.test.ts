import { describe, expect, it } from "vitest";

import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { Player } from "./Player";
import { PlayerBuilder } from "../../test";

describe("Player", () => {
  it("should create an immutable player", () => {
const virat = PlayerBuilder
  .batter()
  .named("Virat Kohli")
  .build();

  expect(virat.name).toBe("Virat Kohli");
  expect(virat.country).toBe(Country.INDIA);
  expect(virat.role).toBe(PlayerRole.BATTER);
  expect(virat.attributes.batting).toBe(88);
  });
});