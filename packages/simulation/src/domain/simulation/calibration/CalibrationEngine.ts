import { SimulationConfig } from "../config/SimulationConfig";

/**
 * CalibrationReport — output of running the calibration engine.
 *
 * Each metric shows: target, actual, and deviation (+ = too high, - = too low).
 */
export interface CalibrationMetric {
  name: string;
  target: number;
  actual: number;
  deviation: number;   // actual - target
  deviationPct: number; // (actual - target) / target * 100
  pass: boolean;       // within tolerance
}

export interface CalibrationReport {
  metrics: CalibrationMetric[];
  passed: boolean;
  summary: string;
}

/**
 * CalibrationEngine validates simulation output against real T20 statistical
 * targets defined in SimulationConfig.calibration.
 *
 * Feed it a set of simulation results and it tells you how far off
 * the current config is, enabling systematic AI-driven tuning.
 *
 * Usage:
 *   const engine = new CalibrationEngine(config);
 *   const report = engine.evaluate(matchResults);
 *   console.log(report.summary);
 */
export class CalibrationEngine {
  private static readonly TOLERANCE = 0.10; // 10% deviation allowed

  public constructor(private readonly config: SimulationConfig) {}

  public evaluate(results: SimulationResults): CalibrationReport {
    const targets = this.config.calibration;
    const metrics: CalibrationMetric[] = [];

    metrics.push(this.metric("Avg runs/innings",  targets.targetAvgRuns,      results.avgRuns));
    metrics.push(this.metric("Avg wickets/innings",targets.targetAvgWickets,   results.avgWickets));
    metrics.push(this.metric("All-out rate",       targets.targetAllOutRate,   results.allOutRate));
    metrics.push(this.metric("Dot ball rate",      targets.targetDotRate,      results.dotRate));
    metrics.push(this.metric("Boundary rate",      targets.targetBoundaryRate, results.boundaryRate));
    metrics.push(this.metric("Extras/innings",     targets.targetExtrasPerInnings, results.avgExtras));

    const passed  = metrics.every((m) => m.pass);
    const failing = metrics.filter((m) => !m.pass);

    const summary = passed
      ? `✓ All ${metrics.length} calibration metrics PASS`
      : [
          `✗ ${failing.length}/${metrics.length} metrics FAIL:`,
          ...failing.map(
            (m) =>
              `  ${m.name}: target=${m.target}, actual=${m.actual.toFixed(2)}, ` +
              `deviation=${m.deviationPct > 0 ? "+" : ""}${m.deviationPct.toFixed(1)}%`,
          ),
        ].join("\n");

    return { metrics, passed, summary };
  }

  private metric(
    name: string,
    target: number,
    actual: number,
  ): CalibrationMetric {
    const deviation    = actual - target;
    const deviationPct = (deviation / target) * 100;
    const pass         = Math.abs(deviationPct) <= CalibrationEngine.TOLERANCE * 100;
    return { name, target, actual, deviation, deviationPct, pass };
  }
}

/**
 * Aggregated statistics from N match simulations, ready for calibration.
 */
export interface SimulationResults {
  simulations:   number;
  avgRuns:       number;
  stdDevRuns:    number;
  avgWickets:    number;
  allOutRate:    number;  // 0.0–1.0
  dotRate:       number;  // 0.0–1.0
  boundaryRate:  number;  // 0.0–1.0
  avgExtras:     number;
}
