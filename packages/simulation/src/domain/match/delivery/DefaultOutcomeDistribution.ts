import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeDistribution } from "./OutcomeDistribution";
import { OutcomeWeight } from "./OutcomeWeight";

/**
 * Default T20 outcome distribution including all legal extras.
 *
 * Total weight = 100.
 *
 * Extras rates reflect real T20 cricket:
 *   Wide:    ~3–5 per innings  → weight 5
 *   No-ball: ~1–2 per innings  → weight 2
 *   Bye:     ~1 per innings    → weight 1
 *   Leg-bye: ~2–3 per innings  → weight 2
 *   Run-out: ~0–1 per innings  → weight 1
 *
 * All probability modifiers (phase, intent, conditions, pressure, etc.)
 * operate on top of these base weights.
 */
export class DefaultOutcomeDistribution {
  private readonly distribution = new OutcomeDistribution([
    // ── Batting outcomes ──────────────────────────────────────────
    new OutcomeWeight(DeliveryOutcome.DOT,    28),
    new OutcomeWeight(DeliveryOutcome.ONE,    25),
    new OutcomeWeight(DeliveryOutcome.TWO,     9),
    new OutcomeWeight(DeliveryOutcome.THREE,   1),
    new OutcomeWeight(DeliveryOutcome.FOUR,   14),
    new OutcomeWeight(DeliveryOutcome.SIX,     6),
    new OutcomeWeight(DeliveryOutcome.WICKET,  6),
    // ── Dismissal ─────────────────────────────────────────────────
    new OutcomeWeight(DeliveryOutcome.RUN_OUT, 1),
    // ── Extras ───────────────────────────────────────────────────
    new OutcomeWeight(DeliveryOutcome.WIDE,    5),
    new OutcomeWeight(DeliveryOutcome.NO_BALL, 2),
    new OutcomeWeight(DeliveryOutcome.BYE,     1),
    new OutcomeWeight(DeliveryOutcome.LEG_BYE, 2),
    // Total: 100
  ]);

  public getDistribution(): OutcomeDistribution {
    return this.distribution;
  }
}
