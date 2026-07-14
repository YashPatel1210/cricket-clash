import { RandomGenerator } from "../src/infrastructure/random";
import { InningsBuilder } from "../src/test/builders";
import { DeliveryGenerator } from "../src/domain/match/delivery/DeliveryGenerator";
import { InningsProcessor } from "../src/domain/match/innings";
import { PlayerBuilder } from "../src/test/builders";
import { SimulationLab } from "../src/lab/SimulationLab";

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
  deliveries: 100000,
});

console.log("=====================================");
console.log(" Cricket Clash Simulation Laboratory ");
console.log("=====================================");

console.table({
  Deliveries: report.getDeliveries(),
  Runs: report.getRuns(),
  Wickets: report.getWickets(),
  "Runs/Ball": report.getRunsPerBall().toFixed(2),
  "Run Rate": report.getRunRate().toFixed(2),
  "Dot %": report.getDotPercentage().toFixed(2),
  "Boundary %": report.getBoundaryPercentage().toFixed(2),
  "Wicket %": report.getWicketPercentage().toFixed(2),
});
