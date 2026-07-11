# ADR-005: Match Aggregate

- **Status:** Accepted
- **Date:** 2026-07-12

---

# Context

With the Draft Engine completed, the simulation enters Phase 2: Match Engine.

The first design decision is identifying the Aggregate Root responsible for representing a cricket match.

The Match Engine will eventually support:

- Toss
- Match conditions
- Two innings
- Overs
- Deliveries
- Match result
- Statistics
- Commentary
- Tournament integration

To prevent business logic from becoming centralized in a single service, the domain model should expose rich aggregates with clear responsibilities.

---

# Decision

`Match` is the Aggregate Root for the Match Engine.

It represents a valid cricket match between two different teams and owns the overall lifecycle of the match.

Initially, Match only contains:

- Team A
- Team B
- Match State

Future versions will include:

- Toss
- Match Conditions
- Innings
- Match Result
- Match Statistics

The Match aggregate **does not simulate cricket**.

Simulation responsibilities belong to dedicated domain services.

---

# Responsibilities

The Match aggregate is responsible for:

- Ensuring two different teams participate
- Tracking match lifecycle
- Exposing participating teams
- Maintaining current match state
- Coordinating future match components

The Match aggregate is **not** responsible for:

- Toss logic
- Ball simulation
- Run calculation
- Wicket probability
- Commentary generation
- AI decision making

---

# Match Lifecycle

```
NOT_STARTED
      │
      ▼
TOSS
      │
      ▼
FIRST_INNINGS
      │
      ▼
INNINGS_BREAK
      │
      ▼
SECOND_INNINGS
      │
      ▼
COMPLETED
```

Each transition must be validated by the Match aggregate.

Invalid state transitions should be rejected.

---

# Aggregate Structure

```
Match
│
├── Team A
├── Team B
├── Match State
│
├── Toss                (future)
├── Match Conditions    (future)
├── Innings             (future)
├── Match Result        (future)
└── Match Statistics    (future)
```

---

# Design Principles

The Match aggregate should remain small and cohesive.

Business rules should be distributed across domain objects rather than centralized inside Match.

Examples:

- Match validates lifecycle.
- Innings validates innings rules.
- Over validates over rules.
- Delivery validates delivery rules.

This follows the same rich domain model used throughout the Draft Engine.

---

# Alternatives Considered

## MatchEngine as Aggregate Root

Rejected.

A service should coordinate behaviour, not own domain state.

Keeping Match as the Aggregate Root aligns with Domain-Driven Design.

---

## Global CricketRules Service

Rejected.

A centralized rules service would become a "God Object" responsible for every cricket rule.

Instead, rules are owned by the domain object they belong to.

---

# Consequences

Advantages:

- Clear Aggregate Root
- Simple lifecycle management
- High cohesion
- Easier testing
- Better extensibility

Trade-offs:

- More domain objects
- More coordination between aggregates
- Requires careful state transition management

These trade-offs are acceptable because they improve long-term maintainability.

---

# Future Work

Future ADRs will define:

- Toss
- Match Conditions
- Innings Aggregate
- Scoreboard
- Match Result
- Statistics
- Commentary
- Tournament Engine
