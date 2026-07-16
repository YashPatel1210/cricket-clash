/**
 * runSimulation.ts
 *
 * Runs a single T20 innings using the full Match Intelligence pipeline
 * and prints a statistical summary.
 *
 * Usage:
 *   pnpm --filter @cricket-clash/simulation benchmark
 *   or from repo root:
 *   tsx packages/simulation/scripts/runSimulation.ts
 */

import { MatchConditions } from "../src/domain/match/conditions/MatchConditions";
import { PitchType } from "../src/domain/match/conditions/PitchType";
import { WeatherCondition } from "../src/domain/match/conditions/WeatherCondition";
import { Stadium } from "../src/domain/match/conditions/Stadium";
import { T20Configuration } from "../src/domain/match/configuration/T20Configuration";
import { Match } from "../src/domain/match/Match";
import { SimulationEngine } from "../src/SimulationEngine";

import { PlayerBuilder } from "../src/test/builders/PlayerBuilder";
import { TeamBuilder } from "../src/test/builders/TeamBuilder";

// ── Build Teams ───────────────────────────────────────────────────────────────

const teamA = new TeamBuilder()
  .withBatters(4)
  .withAllRounders(2)
  .withBowlers(4)
  .withWicketKeepers(1)
  .build();

const teamB = new TeamBuilder()
  .withBatters(4)
  .withAllRounders(2)
  .withBowlers(4)
  .withWicketKeepers(1)
  .build();

// ── Build Match ───────────────────────────────────────────────────────────────

const match = new Match(
  teamA,
  teamB,
  new MatchConditions(PitchType.FLAT, WeatherCondition.SUNNY, new Stadium("MCG")),
  new T20Configuration(),
);

// ── Simulate ──────────────────────────────────────────────────────────────────

const result = SimulationEngine.standard(42).simulate(match);
const scorecard = result.getScorecard();

const firstScore = result.getFirstInnings().getInnings().getScore();
const secondScore = result.getSecondInnings().getInnings().getScore();

console.log("========================================");
console.log("  Cricket Clash — Simulation Laboratory");
console.log("========================================\n");

console.log(`First Innings:  ${firstScore.getRuns()}/${firstScore.getWickets()} (${firstScore.getOvers()} ov)`);
console.log(`Second Innings: ${secondScore.getRuns()}/${secondScore.getWickets()} (${secondScore.getOvers()} ov)`);
console.log(`Result: ${scorecard.isTie() ? "Tie" : "Team Won"}\n`);

console.table({
  "1st Innings Runs":     firstScore.getRuns(),
  "1st Innings Wickets":  firstScore.getWickets(),
  "2nd Innings Runs":     secondScore.getRuns(),
  "2nd Innings Wickets":  secondScore.getWickets(),
});
