import { describe, expect, it } from "vitest";

import { InningsPhase } from "../configuration/InningsPhase";

import { DeliveryContext } from "./DeliveryContext";

describe("DeliveryContext", () => {
  it("should create a delivery context", () => {
    const context = new DeliveryContext(InningsPhase.POWERPLAY);

    expect(context).toBeDefined();
  });

  it("should expose the innings phase", () => {
    const context = new DeliveryContext(InningsPhase.DEATH_OVERS);

    expect(context.getInningsPhase()).toBe(InningsPhase.DEATH_OVERS);
  });
});
