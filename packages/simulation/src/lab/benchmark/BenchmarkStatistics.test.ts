import { describe, expect, it } from "vitest";
import { DeliveryEvent } from "../../domain/match/delivery/DeliveryEvent";
import { MatchRules } from "../../domain/match/configuration";
import { Delivery, DeliveryOutcome } from "../../domain/match/delivery";

import { BenchmarkAccumulator } from "./BenchmarkAccumulator";
import { BenchmarkStatistics } from "./BenchmarkStatistics";
import { SimulationReport } from "../SimulationReport";

describe("BenchmarkStatistics", () => {
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

  it("should calculate average statistics", () => {
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

    const statistics = BenchmarkStatistics.from(accumulator);

    expect(statistics.getIterations()).toBe(2);

    expect(statistics.getAverageRuns()).toBe(7);

    expect(statistics.getAverageWickets()).toBe(1.5);

    expect(statistics.getAverageOvers()).toBeCloseTo((3 / 6 + 5 / 6) / 2);

    expect(statistics.getAverageRunRate()).toBeCloseTo(
      (createReport([
        DeliveryOutcome.ONE,
        DeliveryOutcome.FOUR,
        DeliveryOutcome.WICKET,
      ]).getRunRate() +
        createReport([
          DeliveryOutcome.SIX,
          DeliveryOutcome.TWO,
          DeliveryOutcome.ONE,
          DeliveryOutcome.WICKET,
          DeliveryOutcome.WICKET,
        ]).getRunRate()) /
        2,
    );
  });

  it("should throw when no reports are recorded", () => {
    const accumulator = new BenchmarkAccumulator();

    expect(() => BenchmarkStatistics.from(accumulator)).toThrow(
      "Cannot calculate benchmark statistics without recorded simulations.",
    );
  });
});
