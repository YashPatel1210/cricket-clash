# Sprint 5 — Match Intelligence Engine

Status: In Progress

Start: 2026-07-16

---

## Vision

Sprint 5 elevates Cricket Clash from a random number generator wearing cricket clothes into an **intelligent cricket simulation**.

The core shift is architectural: every delivery is now the product of **intent** meeting **context**, not just weighted randomness.

A batter under death-over pressure with a 12-run-required-rate plays differently than the same batter cruising in the powerplay. A bowler in the final over protects boundaries differently than the same bowler in over 7.

This sprint implements the full documented simulation pipeline:

```
MatchContext → IntentEngine → ProbabilityEngine → OutcomeGenerator → StateProcessor
```

---

## Goals

- Implement the documented Match Context → Intent → Probability pipeline
- Fix critical simulation correctness bugs (strike rotation, bowler over quota)
- Add per-player statistics tracking during innings
- Produce a structured Scorecard from every match
- Add Match lifecycle state transitions
- All changes benchmark-validated against T20 statistical targets

---

## Deliverables

### Milestone 1 — Match Context

A rich, immutable value object that captures the complete match situation at the moment of every delivery.

**New classes:**
- `Partnership` — current batting partnership (runs + balls)
- `MatchContext` — complete situational awareness
- `MatchContextFactory` — builds MatchContext from live innings state

**MatchContext fields:**
- Score (runs, wickets, balls)
- Innings phase (POWERPLAY / MIDDLE_OVERS / DEATH_OVERS)
- Completed overs
- Balls remaining
- Wickets remaining
- Current run rate
- Required run rate (second innings only)
- Target (second innings only)
- Current partnership
- Striker balls faced (new batter detection)
- Pitch type
- Weather condition
- Is first innings flag

---

### Milestone 2 — Intent Engine

The Intent Engine determines what every participant intends to do on this delivery.

**Intent is not outcome. Intent influences probability.**

**New classes:**
- `BatterIntent` — DEFEND / ROTATE / ATTACK / ACCELERATE
- `BowlerIntent` — CONTAIN / ATTACK / YORKER / BOUNCER
- `DeliveryIntent` — container for both
- `BatterIntentResolver` (interface)
- `BowlerIntentResolver` (interface)
- `DefaultBatterIntentResolver` — context-driven batter intent logic
- `DefaultBowlerIntentResolver` — context-driven bowler intent logic
- `IntentEngine` — orchestrates both resolvers

**Batter intent logic:**
- POWERPLAY + not new batter → ATTACK
- DEATH OVERS, 1st innings → ACCELERATE
- DEATH OVERS, 2nd innings, RRR > 12 → ACCELERATE
- DEATH OVERS, 2nd innings, RRR 8–12 → ATTACK
- DEATH OVERS, 2nd innings, RRR < 8 → ROTATE
- MIDDLE OVERS, wickets fallen >= 7 → DEFEND
- MIDDLE OVERS, new batter (balls < 8) → DEFEND
- MIDDLE OVERS, 2nd innings, RRR > 10 → ATTACK
- Default → ROTATE

**Bowler intent logic:**
- POWERPLAY → CONTAIN
- DEATH OVERS → ATTACK
- New batter (striker balls < 8) → ATTACK
- Default → CONTAIN

---

### Milestone 3 — Probability Engine

Replaces the current `BattingDistributionInfluencer` / `BowlingDistributionInfluencer` model with a clean, extensible modifier pipeline.

**New classes:**
- `ModifierContext` — input to every modifier (MatchContext + batter + bowler + intent)
- `OutcomeModifier` (interface) — single modifier responsibility
- `PlayerStrengthModifier` — batter/bowler strength adjustments (extracted from influencers)
- `InningsPhaseModifier` — powerplay/death distribution adjustments
- `BatterIntentModifier` — intent-driven distribution adjustments
- `BowlerIntentModifier` — intent-driven bowling adjustments
- `MatchConditionsModifier` — pitch + weather adjustments
- `ProbabilityEngine` — applies all modifiers in sequence

**Phase adjustments (on top of defaults):**
- POWERPLAY: FOUR +4, SIX +2, DOT -3
- DEATH_OVERS: SIX +3, WICKET +2, DOT -2
- MIDDLE_OVERS: baseline

**Conditions adjustments:**
- PitchType.GREEN (seam): WICKET +3, DOT +2, FOUR -2
- PitchType.FLAT (batting): FOUR +3, DOT -3, WICKET -2
- PitchType.DUSTY (spin): WICKET +2, DOT +3, FOUR -2, SIX -1
- PitchType.DRY: FOUR +1, SIX +1
- WeatherCondition.OVERCAST: DOT +2, WICKET +2
- WeatherCondition.CLOUDY: DOT +1, WICKET +1
- WeatherCondition.SUNNY: baseline
- WeatherCondition.RAINY: (not simulated; match suspended)

**Intent adjustments:**
- BatterIntent.DEFEND: DOT +8, SINGLE +3, WICKET -3, FOUR -4, SIX -4
- BatterIntent.ROTATE: DOT -2, SINGLE +4, WICKET -1
- BatterIntent.ATTACK: FOUR +5, SIX +2, DOT -4, WICKET +1
- BatterIntent.ACCELERATE: SIX +6, FOUR +4, DOT -6, WICKET +3
- BowlerIntent.CONTAIN: DOT +4, FOUR -3, SIX -2
- BowlerIntent.ATTACK: WICKET +3, DOT +2, FOUR -1
- BowlerIntent.YORKER: WICKET +4, DOT +6, FOUR -5, SIX -5

---

### Milestone 4 — Simulation Correctness

Two critical correctness bugs are fixed in this sprint.

#### Strike Rotation at End of Over

After every completed over, the batting pair swaps strike.

`OverEngine` calls `innings.withBattingPair(pair.swapStrike())` after completing each over.

`BattingPair.swapStrike()` already exists.

#### Bowler Over Quota

In T20, each bowler can bowl a maximum of 4 overs (24 balls).

**New class:**
- `BowlerLedger` — tracks total balls bowled per bowler in an innings

**Changes:**
- `MatchRules` gets `maxOversPerBowler: number`
- `BowlingAttack` carries a `BowlerLedger`
- `BowlingAttack.afterOver()` updates ledger and skips exhausted bowlers when selecting next bowler

---

### Milestone 5 — Per-Player Statistics

Every delivery now updates individual player statistics.

**New classes:**
- `BatterRecord` — runs, balls, fours, sixes, isOut, howOut (future)
- `BowlerRecord` — balls, runs, wickets
- `InningsStatistics` — all batter records + bowler records + extras

**Changes:**
- `Innings` carries `InningsStatistics`
- `InningsProcessor` updates statistics on every delivery

---

### Milestone 6 — Scorecard

A structured, complete match output.

**New classes:**
- `Scorecard` — first innings stats + second innings stats + toss + winner + player of the match

**Changes:**
- `MatchResult` includes `Scorecard`
- `ScorecardBuilder` constructs scorecard from match result

---

### Milestone 7 — Match Lifecycle

`Match.state` now transitions through the documented states.

**States:**
```
NOT_STARTED → TOSS → FIRST_INNINGS → INNINGS_BREAK → SECOND_INNINGS → COMPLETED
```

`Match` becomes fully immutable (state transitions return new instances).

`MatchEngine` drives all transitions.

---

### Milestone 8 — Match Configuration on Match

`Match` now carries its `MatchConfiguration`.

This enables the simulation engine to read format rules (max overs, balls per over, phase boundaries, max bowler overs) from the match itself.

---

## Architecture Impact

### New Module Structure

```
domain/match/
  context/
    Partnership.ts
    MatchContext.ts
    MatchContextFactory.ts
    index.ts
  intent/
    BatterIntent.ts
    BowlerIntent.ts
    DeliveryIntent.ts
    BatterIntentResolver.ts
    BowlerIntentResolver.ts
    DefaultBatterIntentResolver.ts
    DefaultBowlerIntentResolver.ts
    IntentEngine.ts
    index.ts
  statistics/
    BatterRecord.ts
    BowlerRecord.ts
    InningsStatistics.ts
    index.ts
  scorecard/
    Scorecard.ts
    ScorecardBuilder.ts
    index.ts

domain/simulation/
  probability/
    ModifierContext.ts
    OutcomeModifier.ts
    PlayerStrengthModifier.ts
    InningsPhaseModifier.ts
    BatterIntentModifier.ts
    BowlerIntentModifier.ts
    MatchConditionsModifier.ts
    ProbabilityEngine.ts
    DefaultProbabilityEngineFactory.ts
    index.ts
```

### Delivery Pipeline (New)

```
DeliveryGenerator.generate(innings, target?)
  → MatchContextFactory.build(innings, target)     [situational awareness]
  → IntentEngine.resolve(context, striker, bowler) [what everyone intends]
  → ProbabilityEngine.calculate(base, modCtx)      [modifier chain]
  → OutcomeSelector.select(distribution)           [deterministic random]
  → DeliveryEventFactory.create(outcome)           [event object]
  → Delivery
```

Each modifier in the probability chain receives `ModifierContext` and returns an updated `OutcomeDistribution`. Modifiers are independent, testable, and composable.

---

## Benchmark Validation

Every change must pass the T20 benchmark profile:

| Metric | Expected Range |
|---|---|
| Average Runs | 150 – 180 |
| Average Overs | 18.5 – 20.0 |
| Average Run Rate | 7.5 – 9.5 |
| Average Wickets | 5 – 8 |
| Dot % | 28 – 38% |
| Boundary % | 18 – 28% |

The intent and probability modifiers will be tuned until the benchmark passes.

---

## Design Principles

Every new component follows:

- **Single Responsibility** — one class, one job
- **Immutability** — value objects return new instances
- **Extensibility** — new modifiers, intents, and strategies added without touching existing code
- **Testability** — every class testable in isolation
- **Explainability** — every delivery outcome traceable through context → intent → probability → outcome

---

## Future Extensions Enabled by This Sprint

- **Captain AI** — add `CaptainStrategy` to `ModifierContext`; implement `CaptainStrategyModifier`
- **Momentum Engine** — add `MomentumScore` to `MatchContext`; implement `MomentumModifier`
- **Fatigue System** — add `FatigueLevel` to player state; implement `FatigueModifier`
- **Psychology Engine** — add `PressureIndex` derived from context; implement `PressureModifier`
- **Field Placement** — add `FieldSetting` to `ModifierContext`; implement `FieldModifier`
- **Pitch Deterioration** — `PitchCondition` changes over innings; feeds `MatchConditionsModifier`
- **Ball Condition** — old vs new ball; feeds `BowlerIntentModifier`
- **Partnership Engine** — long partnerships increase batter confidence; feeds intent resolver
