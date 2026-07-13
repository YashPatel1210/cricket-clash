import { describe, expect, it } from "vitest";
import { PlayerRole } from "@cricket-clash/shared";
import { TeamBuilder } from "../../../test";

import { DefaultBowlingOrderSelector } from "./DefaultBowlingOrderSelector";

describe("DefaultBowlingOrderSelector", () => {
  const selector = new DefaultBowlingOrderSelector();

  it("should select at least one bowler", () => {
    const team = TeamBuilder.standard().build();

    const order = selector.select(team);

    expect(order.getBowlers().length).toBeGreaterThan(0);
  });

  it("should include specialist bowlers", () => {
    const team = TeamBuilder.standard().build();

    const order = selector.select(team);

    expect(
      order
        .getBowlers()
        .every(
          (player) =>
            player.role === PlayerRole.BOWLER ||
            player.role === PlayerRole.ALL_ROUNDER,
        ),
    ).toBe(true);
  });

  it("should expose the first bowler", () => {
    const team = TeamBuilder.standard().build();

    const order = selector.select(team);

    expect(order.current()).toBeDefined();
  });
});
