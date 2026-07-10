import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../test";
import { DraftOption } from "./DraftOption";
import { DraftOptionState } from "./DraftOptionState";

describe("DraftOption", () => {
  it("should create an available draft option", () => {
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const option = new DraftOption(virat);

    expect(option.getPlayer()).toBe(virat);

    expect(option.getStatus())
      .toBe(DraftOptionState.AVAILABLE);

    expect(option.isSelectable())
      .toBe(true);
  });

  it("should not allow already selected player", () => {
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const option = new DraftOption(
      virat,
      DraftOptionState.ALREADY_SELECTED,
    );

    expect(option.isSelectable())
      .toBe(false);
  });
});