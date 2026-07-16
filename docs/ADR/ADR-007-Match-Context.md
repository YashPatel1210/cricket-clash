# ADR-007 — Match Context as First-Class Pipeline Object

Date: 2026-07-16

Status: Accepted

---

## Context

The current simulation generates deliveries using only the `Innings` aggregate and player attributes.

No structured "match situation" object exists. The delivery generator cannot answer questions like:

- What is the required run rate?
- Are we in the powerplay?
- How many wickets have fallen?
- Is this a new batter?
- What are the pitch conditions?

These are the exact inputs that drive intelligent cricket decisions. Without them, the simulation cannot model realistic player behaviour.

---

## Decision

Introduce `MatchContext` as an **immutable value object** computed before every delivery and passed through the full delivery pipeline.

`MatchContext` is the single source of situational truth for the delivery pipeline.

```typescript
MatchContext {
  score: Score
  phase: InningsPhase
  completedOvers: number
  ballsRemaining: number
  wicketsRemaining: number
  currentRunRate: number
  requiredRunRate: number | undefined
  target: Target | undefined
  partnership: Partnership
  strikerBallsFaced: number
  pitchType: PitchType
  weatherCondition: WeatherCondition
  isFirstInnings: boolean
}
```

`MatchContextFactory` builds `MatchContext` from the current `Innings` state, `MatchConfiguration`, optional `Target`, and `MatchConditions`.

---

## Consequences

### Positive

- Single structured object representing the entire match situation
- Intent Engine has everything it needs to make intelligent decisions
- All Probability Engine modifiers receive the same contextual input
- Fully serializable and inspectable for debugging and replay
- Future fields (momentum, fatigue, ball condition, field setting) added here without changing the pipeline contract

### Negative

- Object is rebuilt on every delivery (negligible; all fields are simple computations)
- `MatchContextFactory` must be injected into `DeliveryGenerator` (slightly more complex construction)

---

## Key Design Choices

### Computed fields, not stored fields

`currentRunRate`, `requiredRunRate`, `completedOvers`, `wicketsRemaining`, and `ballsRemaining` are all derived from `Score` and configuration at build time. They are not separately tracked state.

### `strikerBallsFaced` from InningsStatistics

The number of balls faced by the current striker is derived from `InningsStatistics.getBatterRecord(striker)` during context building. This enables the "new batter" detection used by the Intent Engine.

### Partnership from Innings

`Partnership` is carried by `Innings` and reset on wicket. `MatchContext` receives it as a snapshot.

---

## Alternatives Considered

### Pass individual fields separately

Pass score, phase, RRR etc. as separate parameters to the intent and probability engines.

**Rejected.**

Produces long parameter lists, breaks extensibility, and makes future additions require changing all call sites.

### Derive from Innings directly

Give the Intent Engine and Probability Engine direct access to `Innings`.

**Rejected.**

`Innings` is a domain aggregate with state management behaviour. Passing it to strategy objects creates inappropriate coupling. `MatchContext` is a clean read-only snapshot.
