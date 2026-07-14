import { describe, expect, it } from "vitest";

import { DeliveryEvent } from "./DeliveryEvent";
import { DeliveryOutcome } from "./DeliveryOutcome";

describe("DeliveryEvent", () => {
  it("should create a delivery event", () => {
    const event = new DeliveryEvent(DeliveryOutcome.FOUR, 4, true);

    expect(event).toBeDefined();
  });

  it("should expose outcome", () => {
    const event = new DeliveryEvent(DeliveryOutcome.ONE, 1, true);

    expect(event.getOutcome()).toBe(DeliveryOutcome.ONE);
  });

  it("should expose runs", () => {
    const event = new DeliveryEvent(DeliveryOutcome.THREE, 3, true);

    expect(event.getRuns()).toBe(3);
  });

  it("should expose legal delivery", () => {
    const event = new DeliveryEvent(DeliveryOutcome.DOT, 0, true);

    expect(event.isLegal()).toBe(true);
  });

  it("should identify boundaries", () => {
    expect(new DeliveryEvent(DeliveryOutcome.FOUR, 4, true).isBoundary()).toBe(
      true,
    );

    expect(new DeliveryEvent(DeliveryOutcome.SIX, 6, true).isBoundary()).toBe(
      true,
    );

    expect(new DeliveryEvent(DeliveryOutcome.ONE, 1, true).isBoundary()).toBe(
      false,
    );
  });

  it("should identify wickets", () => {
    expect(new DeliveryEvent(DeliveryOutcome.WICKET, 0, true).isWicket()).toBe(
      true,
    );

    expect(new DeliveryEvent(DeliveryOutcome.TWO, 2, true).isWicket()).toBe(
      false,
    );
  });
  it("should identify wides", () => {
    expect(new DeliveryEvent(DeliveryOutcome.WIDE, 1, false).isWide()).toBe(
      true,
    );
  });

  it("should identify no balls", () => {
    expect(
      new DeliveryEvent(DeliveryOutcome.NO_BALL, 1, false).isNoBall(),
    ).toBe(true);
  });

  it("should identify byes", () => {
    expect(new DeliveryEvent(DeliveryOutcome.BYE, 1, true).isBye()).toBe(true);
  });

  it("should identify leg byes", () => {
    expect(new DeliveryEvent(DeliveryOutcome.LEG_BYE, 1, true).isLegBye()).toBe(
      true,
    );
  });

  it("should identify extras", () => {
    expect(new DeliveryEvent(DeliveryOutcome.WIDE, 1, false).isExtra()).toBe(
      true,
    );
  });

  it("should identify dismissals", () => {
    expect(
      new DeliveryEvent(DeliveryOutcome.RUN_OUT, 0, true).isDismissal(),
    ).toBe(true);
  });

  it("should distinguish wickets from dismissals", () => {
    const runOut = new DeliveryEvent(DeliveryOutcome.RUN_OUT, 0, true);

    expect(runOut.isDismissal()).toBe(true);
    expect(runOut.isWicket()).toBe(false);
  });
});
