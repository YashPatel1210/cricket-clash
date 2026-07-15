import { describe, expect, it } from "vitest";

import { InningsPhase } from "./InningsPhase";
import { InningsPhases } from "./InningsPhases";

describe("InningsPhases", () => {
  it("should create innings phases", () => {
    const phases = new InningsPhases(6, 16);

    expect(phases).toBeDefined();
  });

  it("should reject a negative powerplay", () => {
    expect(() => new InningsPhases(-1, 16)).toThrow(
      "Powerplay overs cannot be negative.",
    );
  });

  it("should reject a death phase before the powerplay ends", () => {
    expect(() => new InningsPhases(6, 6)).toThrow(
      "Death overs must begin after the powerplay.",
    );
  });

  it("should identify the powerplay", () => {
    const phases = new InningsPhases(6, 16);

    expect(phases.phaseAt(0)).toBe(InningsPhase.POWERPLAY);
    expect(phases.phaseAt(5)).toBe(InningsPhase.POWERPLAY);
  });

  it("should identify the middle overs", () => {
    const phases = new InningsPhases(6, 16);

    expect(phases.phaseAt(6)).toBe(InningsPhase.MIDDLE_OVERS);
    expect(phases.phaseAt(15)).toBe(InningsPhase.MIDDLE_OVERS);
  });

  it("should identify the death overs", () => {
    const phases = new InningsPhases(6, 16);

    expect(phases.phaseAt(16)).toBe(InningsPhase.DEATH_OVERS);
    expect(phases.phaseAt(19)).toBe(InningsPhase.DEATH_OVERS);
  });
});
