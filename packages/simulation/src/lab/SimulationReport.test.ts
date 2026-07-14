import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../test";

import { BattingPair, BowlingSpell } from "../domain/match/innings";
import { DeliveryEventFactory } from "../domain/match/delivery/DeliveryEventFactory";
import { Delivery, DeliveryOutcome } from "../domain/match/delivery";

import { SimulationReport } from "./SimulationReport";

describe("SimulationReport", () => {
  const factory = new DeliveryEventFactory();

  function delivery(outcome: DeliveryOutcome): Delivery {
    return new Delivery(
      new BowlingSpell(PlayerBuilder.bowler().build(), 0),
      new BattingPair(
        PlayerBuilder.batter().build(),
        PlayerBuilder.batter().build(),
      ),
      factory.create(outcome),
    );
  }

  it("should start empty", () => {
    const report = new SimulationReport();

    expect(report.getDeliveries()).toBe(0);
    expect(report.getRuns()).toBe(0);
    expect(report.getWickets()).toBe(0);
    expect(report.getRunRate()).toBe(0);
  });

  it("should record a dot ball", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.DOT));

    expect(report.getDeliveries()).toBe(1);
    expect(report.getDots()).toBe(1);
    expect(report.getRuns()).toBe(0);
  });

  it("should record a single", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.ONE));

    expect(report.getSingles()).toBe(1);
    expect(report.getRuns()).toBe(1);
  });

  it("should record a boundary", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.FOUR));

    expect(report.getRuns()).toBe(4);
    expect(report.getFours()).toBe(1);
  });

  it("should record a six", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.SIX));

    expect(report.getRuns()).toBe(6);
    expect(report.getSixes()).toBe(1);
  });

  it("should record a wicket", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.WICKET));

    expect(report.getWickets()).toBe(1);
  });

  it("should calculate runs per ball", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.FOUR));

    report.record(delivery(DeliveryOutcome.TWO));

    expect(report.getRuns()).toBe(6);
    expect(report.getDeliveries()).toBe(2);
    expect(report.getRunsPerBall()).toBe(3);
  });

  it("should calculate run rate", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.FOUR));

    report.record(delivery(DeliveryOutcome.TWO));

    expect(report.getRunRate()).toBe(18);
  });

  it("should calculate dot percentage", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.DOT));

    report.record(delivery(DeliveryOutcome.FOUR));

    expect(report.getDotPercentage()).toBe(50);
  });

  it("should calculate boundary percentage", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.FOUR));

    report.record(delivery(DeliveryOutcome.SIX));

    report.record(delivery(DeliveryOutcome.DOT));

    expect(report.getBoundaryPercentage()).toBeCloseTo(66.67, 1);
  });

  it("should calculate wicket percentage", () => {
    const report = new SimulationReport();

    report.record(delivery(DeliveryOutcome.WICKET));

    report.record(delivery(DeliveryOutcome.DOT));

    expect(report.getWicketPercentage()).toBe(50);
  });
});
