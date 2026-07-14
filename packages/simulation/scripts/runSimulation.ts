import { RandomGenerator } from "../src/infrastructure/random";

import { DeliveryGenerator } from "../src/domain/match/delivery/DeliveryGenerator";
import { InningsProcessor } from "../src/domain/match/innings";

import { T20Configuration } from "../src/domain/match/configuration";

import { SimulationLab } from "../src/lab/SimulationLab";

import { InningsBuilder, PlayerBuilder } from "../src/test/builders";

const striker = PlayerBuilder.batter().build();

const bowler = PlayerBuilder.bowler().build();

const innings = InningsBuilder.standard()
  .withStriker(striker)
  .withBowler(bowler)
  .build();

const lab = new SimulationLab(
  new DeliveryGenerator(new RandomGenerator(42)),
  new InningsProcessor(),
);

const report = lab.run({
  innings,
  configuration: new T20Configuration(),
});

console.log("========================================");
console.log(" Cricket Clash Simulation Laboratory");
console.log("========================================");

console.table({
  Format: "T20",
  Overs: report.getOvers().toFixed(1),
  Runs: report.getRuns(),
  Wickets: report.getWickets(),
  "Runs/Ball": report.getRunsPerBall().toFixed(2),
  "Run Rate": report.getRunRate().toFixed(2),
  "Dot %": report.getDotPercentage().toFixed(2),
  "Boundary %": report.getBoundaryPercentage().toFixed(2),
  "Wicket %": report.getWicketPercentage().toFixed(2),
});
