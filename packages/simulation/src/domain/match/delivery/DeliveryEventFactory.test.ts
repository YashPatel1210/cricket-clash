import { describe, expect, it } from "vitest";

import { DeliveryEventFactory } from "./DeliveryEventFactory";
import { DeliveryOutcome } from "./DeliveryOutcome";

describe("DeliveryEventFactory", () => {
  const factory = new DeliveryEventFactory();

  it("should create a dot ball", () => {
    const event = factory.create(DeliveryOutcome.DOT);

    expect(event.getRuns()).toBe(0);
    expect(event.isLegal()).toBe(true);
  });

  it("should create a boundary", () => {
    const event = factory.create(DeliveryOutcome.FOUR);

    expect(event.getRuns()).toBe(4);
    expect(event.isBoundary()).toBe(true);
  });

  it("should create a wicket", () => {
    const event = factory.create(DeliveryOutcome.WICKET);

    expect(event.isWicket()).toBe(true);
  });

  it("should create a wide", () => {
    const event = factory.create(DeliveryOutcome.WIDE);

    expect(event.isWide()).toBe(true);
    expect(event.isLegal()).toBe(false);
  });

  it("should create a no ball", () => {
    const event = factory.create(DeliveryOutcome.NO_BALL);

    expect(event.isNoBall()).toBe(true);
    expect(event.isLegal()).toBe(false);
  });

  it("should create a run out", () => {
    const event = factory.create(DeliveryOutcome.RUN_OUT);

    expect(event.isDismissal()).toBe(true);
    expect(event.isWicket()).toBe(false);
  });
});
