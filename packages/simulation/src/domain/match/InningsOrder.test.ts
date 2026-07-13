import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../test";

import { InningsOrder } from "./InningsOrder";

describe("InningsOrder", () => {
  it("should store batting team", () => {
    const battingTeam = TeamBuilder.standard().build();

    const bowlingTeam = TeamBuilder.standard().build();

    const order = new InningsOrder(battingTeam, bowlingTeam);

    expect(order.getBattingTeam()).toBe(battingTeam);
  });

  it("should store bowling team", () => {
    const battingTeam = TeamBuilder.standard().build();

    const bowlingTeam = TeamBuilder.standard().build();

    const order = new InningsOrder(battingTeam, bowlingTeam);

    expect(order.getBowlingTeam()).toBe(bowlingTeam);
  });

  it("should require different teams", () => {
    const team = TeamBuilder.standard().build();

    expect(() => new InningsOrder(team, team)).toThrow(
      "Batting and bowling teams must be different.",
    );
  });
});
