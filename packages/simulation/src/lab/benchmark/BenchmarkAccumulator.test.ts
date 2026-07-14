import { describe, expect, it } from "vitest";
import { DeliveryEvent } from "../../domain/match/delivery/DeliveryEvent";
import { MatchRules } from "../../domain/match/configuration";
import { Delivery, DeliveryOutcome } from "../../domain/match/delivery";

import { BenchmarkAccumulator } from "./BenchmarkAccumulator";
import { SimulationReport } from "../SimulationReport";

describe("BenchmarkAccumulator", () => {
  function createReport(
    outcomes: readonly DeliveryOutcome[],
  ): SimulationReport {
    const report = new SimulationReport(new MatchRules(20));

    for (const outcome of outcomes) {
      report.record(createDelivery(outcome));
    }

    return report;
  }

  function createDelivery(outcome: DeliveryOutcome): Delivery {
    let runs = 0;

    switch (outcome) {
      case DeliveryOutcome.ONE:
        runs = 1;
        break;

      case DeliveryOutcome.TWO:
        runs = 2;
        break;

      case DeliveryOutcome.THREE:
        runs = 3;
        break;

      case DeliveryOutcome.FOUR:
        runs = 4;
        break;

      case DeliveryOutcome.SIX:
        runs = 6;
        break;

      default:
        runs = 0;
    }

    return {
      runs: () => runs,

      getEvent: () => new DeliveryEvent(outcome, runs, true),

      isWicket: () => outcome === DeliveryOutcome.WICKET,
    } as Delivery;
  }

  it("should start empty", () => {
    const accumulator = new BenchmarkAccumulator();

    expect(accumulator.getIterations()).toBe(0);
    expect(accumulator.getTotalRuns()).toBe(0);
    expect(accumulator.getTotalOvers()).toBe(0);
    expect(accumulator.getTotalRunRate()).toBe(0);
    expect(accumulator.getTotalWickets()).toBe(0);
    expect(accumulator.getTotalDotPercentage()).toBe(0);
    expect(accumulator.getTotalBoundaryPercentage()).toBe(0);
  });

  it("should record one report", () => {
    const accumulator = new BenchmarkAccumulator();

    accumulator.record(
      createReport([
        DeliveryOutcome.ONE,
        DeliveryOutcome.ONE,
        DeliveryOutcome.FOUR,
        DeliveryOutcome.WICKET,
      ]),
    );

    expect(accumulator.getIterations()).toBe(1);
    expect(accumulator.getTotalRuns()).toBe(6);
    expect(accumulator.getTotalWickets()).toBe(1);
  });

  it("should accumulate multiple reports", () => {
    const accumulator = new BenchmarkAccumulator();

    accumulator.record(
      createReport([
        DeliveryOutcome.ONE,
        DeliveryOutcome.FOUR,
        DeliveryOutcome.WICKET,
      ]),
    );

    accumulator.record(
      createReport([
        DeliveryOutcome.SIX,
        DeliveryOutcome.TWO,
        DeliveryOutcome.ONE,
        DeliveryOutcome.WICKET,
        DeliveryOutcome.WICKET,
      ]),
    );

    expect(accumulator.getIterations()).toBe(2);

    expect(accumulator.getTotalRuns()).toBe(14);

    expect(accumulator.getTotalWickets()).toBe(3);
  });
});
