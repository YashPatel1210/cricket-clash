# Cricket Clash Simulation Engine

Version: 0.3

---

# Vision

Cricket Clash is designed as a deterministic cricket simulation engine.

Given:

- identical teams
- identical draft
- identical random seed

the engine must always produce the exact same match.

This allows:

- replayable matches
- AI simulations
- multiplayer fairness
- debugging
- deterministic testing

The engine is built using Domain Driven Design (DDD), immutable domain objects and Test Driven Development (TDD).

---

# High Level Architecture

```
                    Simulation Engine
                           │
            ┌──────────────┴──────────────┐
            │                             │
      Draft Engine                  Match Engine
            │                             │
      Team Generation             Cricket Simulation
```

---

# Draft Engine

Responsibilities

- Generate Playing XI
- Enforce team rules
- Prevent duplicate players
- Respect role limits
- Produce deterministic drafts

Core Classes

- Player
- Team
- TeamSelection
- PlayerPool
- DraftContext
- DraftGenerator

---

# Match Engine

Responsibilities

- Match creation
- Toss
- Innings simulation
- Delivery simulation
- Score updates
- Match completion

---

# Match Flow

```
Match

↓

Toss

↓

First Innings

↓

Second Innings

↓

Winner
```

---

# Innings Flow

```
Current Innings

↓

Delivery Generator

↓

Delivery

↓

Innings Processor

↓

Updated Innings

↓

Repeat
```

---

# Future Over Flow

```
Over Processor

↓

Generate Delivery

↓

Process Delivery

↓

Repeat

↓

6 legal balls completed
```

---

# Domain Model

## Match

Aggregate Root

Owns

- Match Conditions
- Toss
- Innings

---

## Innings

Aggregate Root

Owns

- Score
- BattingPair
- BowlingSpell
- BattingOrder

Responsible for representing the complete state of one innings.

---

## Score

Immutable Value Object

Responsible for

- Runs
- Wickets
- Balls

Provides

- afterRuns()
- afterBall()
- afterWicket()

---

## BattingPair

Immutable Value Object

Responsible for

- Striker
- Non-Striker

Provides

- afterRuns()
- replaceStriker()

---

## BowlingSpell

Immutable Value Object

Responsible for

- Current Bowler
- Balls Bowled

Provides

- afterBall()

---

## BattingOrder

Immutable Value Object

Responsible for

- Remaining batters

Provides

- next()
- afterNext()

---

## Delivery

Represents one cricket ball.

Contains

- BattingPair
- BowlingSpell
- DeliveryEvent

---

## DeliveryEvent

Represents what happened on a ball.

Contains

- Outcome
- Runs
- Legal Delivery

Future versions will include

- Extras
- Dismissal Type
- Batter Out
- Boundary Type

---

# Current Simulation Pipeline

```
Current Innings

↓

DeliveryGenerator

↓

Delivery

↓

InningsProcessor

↓

Updated Innings
```

---

# Design Principles

## Immutability

Domain objects never mutate.

Instead

```
score.afterRuns(4)
```

returns a new Score.

---

## Deterministic Simulation

Every random decision is generated from RandomGenerator.

The same seed must always produce

- identical draft
- identical deliveries
- identical match

---

## Rich Domain Model

Business rules belong inside domain objects.

Examples

Score

```
afterRuns()

afterBall()
```

BattingPair

```
afterRuns()

replaceStriker()
```

BowlingSpell

```
afterBall()
```

The engine orchestrates.

Domain objects own behaviour.

---

## Separation of Responsibilities

DeliveryGenerator

Determines what happened.

InningsProcessor

Applies what happened.

Delivery

Represents what happened.

Score

Tracks score.

BattingPair

Tracks strike.

BowlingSpell

Tracks bowler progress.

BattingOrder

Tracks remaining batters.

---

# Current Roadmap

Completed

- Player
- Team
- Draft Engine
- Match
- Toss
- Score
- BattingPair
- BowlingSpell
- BattingOrder
- Delivery
- DeliveryGenerator
- InningsProcessor

Upcoming

- Over
- OverProcessor
- Bowling Rotation
- Probability Strategy
- Extras
- Match Engine
- Statistics
- Scorecard

---

# End Goal

The simulation engine should eventually execute:

```
Create Match

↓

Draft Teams

↓

Play Toss

↓

Simulate First Innings

↓

Simulate Second Innings

↓

Determine Winner

↓

Generate Complete Scorecard
```

without any UI dependency.

The engine should be reusable from:

- Web Application
- Mobile Application
- AI Simulation
- Multiplayer Backend
- Tournament Scheduler
