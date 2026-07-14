import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../test";

import { RandomGenerator } from "../infrastructure/random";

import { DeliveryGenerator } from "../domain/match/delivery/DeliveryGenerator";

import { InningsProcessor } from "../domain/match/innings";

import { SimulationLab } from "./SimulationLab";

describe("SimulationLab", () => {
  it("should simulate the requested number of deliveries", () => {
    const lab = new SimulationLab(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const report = lab.run({
      innings: InningsBuilder.standard().build(),
      deliveries: 120,
    });

    expect(report.getDeliveries()).toBe(120);
  });

  it("should accumulate runs", () => {
    const lab = new SimulationLab(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const report = lab.run({
      innings: InningsBuilder.standard().build(),
      deliveries: 120,
    });

    expect(report.getRuns()).toBeGreaterThan(0);
  });

  it("should produce a valid run rate", () => {
    const lab = new SimulationLab(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const report = lab.run({
      innings: InningsBuilder.standard().build(),
      deliveries: 120,
    });

    expect(report.getRunRate()).toBeGreaterThan(0);
  });

  it("should produce valid percentages", () => {
    const lab = new SimulationLab(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const report = lab.run({
      innings: InningsBuilder.standard().build(),
      deliveries: 1000,
    });

    expect(report.getDotPercentage()).toBeGreaterThan(0);

    expect(report.getBoundaryPercentage()).toBeGreaterThan(0);

    expect(report.getWicketPercentage()).toBeGreaterThanOrEqual(0);
  });
});
