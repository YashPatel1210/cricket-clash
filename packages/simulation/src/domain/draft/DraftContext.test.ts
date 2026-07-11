import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../test";
import { PlayerPool } from "./PlayerPool";
import { RandomGenerator } from "../../infrastructure/random";
import { DraftContext } from "./DraftContext";

describe("DraftContext", () => {
  it("should expose draft dependencies", () => {
    const team = TeamBuilder.standard().build();

    const pool = new PlayerPool([]);

    const random = new RandomGenerator(42);

    const context = new DraftContext(
      pool,
      team,
      random,
    );

    expect(context.getTeam()).toBe(team);
    expect(context.getPlayerPool()).toBe(pool);
    expect(context.getRandom()).toBe(random);
  });
});