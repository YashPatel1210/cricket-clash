import { describe, expect, it } from "vitest";

import { STANDARD_T20_TEAM_RULES } from "../rules";
import { Team } from "../team";
import { Draft } from "./Draft";
import { DraftStatus } from "./DraftStatus";

describe("Draft", () => {
  it("should create a new draft", () => {
    const draft = new Draft(
      "draft-1",
      12345,
      new Team(STANDARD_T20_TEAM_RULES),
    );

    expect(draft.id).toBe("draft-1");

    expect(draft.seed).toBe(12345);

    expect(draft.getCurrentRound()).toBe(1);

    expect(draft.getRemainingPicks()).toBe(12);

    expect(draft.getStatus()).toBe(
      DraftStatus.IN_PROGRESS,
    );
  });
});