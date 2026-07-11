# ADR-004: Deterministic Random Generation

## Status

Accepted

---

## Context

Cricket Clash is a simulation game.

Many gameplay systems require randomness, including:

- Draft generation
- Country selection
- Playing XI generation
- Toss
- Ball-by-ball outcomes
- Fielding events
- Commentary variation
- Future AI behaviour

Using `Math.random()` directly throughout the codebase would introduce several problems:

- Simulations cannot be reproduced.
- Unit tests become unreliable.
- Bugs are difficult to reproduce.
- Match replays become impossible.
- Different platforms may produce inconsistent results.

The engine requires deterministic behaviour when given the same initial conditions.

---

## Decision

All random behaviour must be generated through a dedicated `RandomGenerator`.

No domain object should call `Math.random()` directly.

Every simulation receives a seed.

Given the same:

- Seed
- Match configuration
- Player data
- Rules

the simulation must always produce identical results.

Architecture:

Seed
        │
        ▼
RandomGenerator
        │
        ├── CountrySelector
        ├── RoleBalancer
        ├── WeightedRandomStrategy
        ├── DraftGenerator
        └── Match Engine

---

## Rationale

A dedicated random generator provides several advantages.

### Reproducibility

The same draft or match can be recreated exactly.

This is essential for:

- Debugging
- Match replays
- Spectator mode
- AI testing

---

### Testability

Unit tests become deterministic.

Instead of relying on unpredictable random values, tests can use known seeds and verify exact outcomes.

---

### Consistency

All gameplay systems use the same source of randomness.

This avoids hidden differences between independent implementations.

---

### Future Extensibility

Additional random strategies can be introduced without changing the domain model.

Examples include:

- Different AI difficulty levels
- Tournament modifiers
- Event-based randomness
- Seasonal gameplay variations

---

## Consequences

### Advantages

- Deterministic simulations
- Reproducible bugs
- Stable automated tests
- Replay support
- Shared random behaviour across the engine
- Easier balancing and tuning

### Disadvantages

- Slightly more infrastructure
- Random generator must be passed into systems that require randomness

---

## Future Evolution

The initial implementation will provide only a small set of operations.

Example:

- nextInt()
- nextFloat()
- pick()
- shuffle()

Future versions may support:

- Weighted selection
- Gaussian distributions
- Probability tables
- Multiple independent random streams
- Simulation replay tools

The public API should remain stable as additional algorithms are introduced internally.

---

## Alternatives Considered

### Use Math.random()

Rejected.

Although simple, it produces non-deterministic behaviour and prevents reproducible simulations.

---

### Each component owns its own random implementation

Rejected.

This duplicates logic and makes it difficult to guarantee consistent behaviour across the engine.

---

## Decision Summary

Randomness is treated as infrastructure rather than business logic.

Every gameplay system receives randomness through a shared deterministic `RandomGenerator`.

No domain object should directly depend on `Math.random()`.