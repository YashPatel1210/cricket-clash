## Sprint 5 — Match Intelligence Engine

### Architecture

- `Match` is now fully immutable — state transitions return new instances
- `Match` carries `MatchConfiguration` — match knows its own format rules
- Delivery pipeline upgraded: `MatchContext → IntentEngine → ProbabilityEngine → Outcome`

### New: MatchContext

- `Partnership` value object — tracks current batting partnership (runs + balls)
- `MatchContext` — immutable situational awareness for every delivery (score, phase, RRR, pitch, weather, striker balls faced)
- `MatchContextFactory` — builds context from live innings state

### New: Intent Engine (ADR-006)

- `BatterIntent` enum — DEFEND / ROTATE / ATTACK / ACCELERATE
- `BowlerIntent` enum — CONTAIN / ATTACK / YORKER / BOUNCER
- `DeliveryIntent` value object — combined intent container
- `DefaultBatterIntentResolver` — context-driven batter intent logic
- `DefaultBowlerIntentResolver` — context-driven bowler intent logic
- `IntentEngine` — orchestrates both resolvers

### New: Probability Engine

- `OutcomeModifier` interface — extensible modifier strategy
- `ModifierContext` — input to all modifiers
- `PlayerStrengthModifier` — batter/bowler quality adjustments
- `InningsPhaseModifier` — powerplay and death overs distribution shifts
- `BatterIntentModifier` — intent-driven batter distribution
- `BowlerIntentModifier` — intent-driven bowler distribution
- `MatchConditionsModifier` — pitch type and weather effects
- `ProbabilityEngine` — sequential modifier pipeline
- `DefaultProbabilityEngineFactory` — standard 5-modifier chain

### New: Per-Player Statistics

- `BatterRecord` — runs, balls, fours, sixes, isOut per batter
- `BowlerRecord` — balls, runs, wickets per bowler
- `InningsStatistics` — aggregates all batter and bowler records
- `Innings` now carries `InningsStatistics` and `Partnership`
- `InningsProcessor` updates statistics and partnership on every delivery

### New: Scorecard

- `Scorecard` — complete match output (both innings stats, toss, winner)
- `MatchResult.getScorecard()` — always available after simulation

### Correctness Fixes

- **Strike rotation at end of over** — `OverEngine` now swaps batting pair after every completed over
- **Bowler over quota** — `BowlerLedger` tracks cumulative balls per bowler; `BowlingAttack.afterOver()` skips exhausted bowlers
- `BowlingAttack` redesigned — now owns the `BowlerLedger` and quota enforcement
- `MatchRules.getMaxBallsPerBowler()` added — T20: 24 balls (4 overs)

### Match Lifecycle State Machine (ADR-005 implementation)

- `Match` lifecycle transitions: NOT_STARTED → TOSS → INNINGS_BREAK → COMPLETED
- `Match.withToss()`, `Match.withFirstInnings()`, `Match.withSecondInnings()` — immutable transitions

### Documentation

- Sprint-05.md — full sprint plan
- ADR-006 — Intent Engine Architecture
- ADR-007 — Match Context as First-Class Pipeline Object

---

## Sprint 4.0 – Draft Domain Foundation


### Added

- Draft aggregate
- DraftRound skeleton
- DraftOption entity
- DraftOptionState
- DraftOptionDisableReason

### Documentation

- Draft System GDD
- Weighted Randomness GDD
- Team Confidence GDD
- Glossary
- ADR-002 Draft Architecture

### Improvements

- Renamed DraftOptionStatus → DraftOptionState
- Improved draft terminology consistency

# Changelog

All notable changes to Cricket Clash Simulation Engine will be documented here.

---

## Sprint 4.8 (In Progress)

### Added

- RandomGenerator infrastructure
- Deterministic random generation
- ADR-004

---

## Sprint 4.7

### Added

- Immutable PlayerPool
- Player exclusion pipeline

### Improved

- Team exposes selectedPlayerIds()

---

## Sprint 4.6

### Added

- PlayerRepository
- InMemoryPlayerRepository

---

## Sprint 4.5

### Added

- PlayingXI aggregate

---

## Sprint 4.4

### Added

- Draft aggregate
- DraftRound
- DraftOption