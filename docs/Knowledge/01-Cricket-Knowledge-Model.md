# Cricket Knowledge Model

## Purpose

The Cricket Knowledge Model defines every measurable concept used by Cricket Clash.

It acts as the single source of truth for:

- Analytics
- Simulation
- Artificial Intelligence
- Player Ratings
- Team Ratings
- Venue Intelligence
- Match Prediction

This document does not describe implementation.

It describes cricket knowledge.

---

# Philosophy

Every piece of information belongs to exactly one layer.

```
Facts
        ↓
Derived Metrics
        ↓
Simulation Attributes
        ↓
Runtime State
```

Understanding this separation is critical.

---

# Layer 1 — Facts

Facts are objective observations collected from real cricket matches.

Facts are never estimated.

Facts are never manually rated.

Facts are immutable.

Examples:

## Batting

- Runs
- Balls Faced
- Fours
- Sixes
- Dot Balls
- Singles
- Doubles
- Triples
- Strike Rate
- Dismissal Type

---

## Bowling

- Overs
- Balls
- Maidens
- Runs Conceded
- Wickets
- Dot Balls
- Wides
- No Balls

---

## Fielding

- Catches
- Run Outs
- Stumpings
- Direct Hits
- Missed Chances

---

## Match

- Venue
- Pitch
- Weather
- Opposition
- Toss
- Match Result

Facts are imported from historical cricket data.

---

# Layer 2 — Derived Metrics

Derived metrics are calculated from facts.

Examples:

Batting

- Boundary Percentage
- Dot Ball Percentage
- Strike Rotation Percentage
- Control Percentage
- Batting Consistency

Bowling

- Economy
- Bowling Consistency
- Wicket Frequency
- Death Overs Economy
- Powerplay Economy

Fielding

- Catch Success Rate
- Throw Accuracy
- Ground Fielding Rating

Derived metrics may change whenever new matches are imported.

---

# Layer 3 — Simulation Attributes

Simulation attributes are generated from derived metrics.

These are the values consumed by the simulation engine.

Examples:

Batting

- Aggression
- Strike Rotation
- Boundary Ability
- Pace Ability
- Spin Ability
- Pressure Handling

Bowling

- Yorker Accuracy
- Swing Ability
- Seam Movement
- Spin Quality
- Variation
- Death Overs Skill

Fielding

- Catching
- Throw Accuracy
- Reflexes

Leadership

- Captaincy
- Decision Making

Mental

- Composure
- Adaptability

Simulation attributes are generated automatically.

They are never edited manually.

---

# Layer 4 — Runtime State

Runtime state only exists during a simulated match.

Examples:

- Confidence
- Fatigue
- Momentum
- Partnership Rhythm
- Injury
- Ball Tracking
- Current Match Statistics

Runtime state is never persisted as historical knowledge.

It is recreated for every simulated match.

---

# Knowledge Ownership

Knowledge belongs to different domains.

## Player Knowledge

Long-term player intelligence.

## Team Knowledge

Long-term team intelligence.

## Venue Knowledge

Ground dimensions.

Boundary sizes.

Pitch behaviour.

Home advantage.

## Competition Knowledge

Tournament format.

Pressure.

Historical trends.

---

# Simulation Boundary

The Simulation Engine never analyses historical data.

The Simulation Engine consumes generated knowledge.

```
Historical Data
        │
        ▼
Analytics
        │
        ▼
Knowledge
        │
        ▼
Simulation
```

---

# Guiding Principles

## Facts First

Every rating must be explainable by historical facts.

---

## Knowledge Is Derived

Ratings are generated.

They are never manually assigned.

---

## Runtime Is Ephemeral

Runtime information exists only during a match.

Nothing from runtime modifies historical knowledge.

---

## Explainability

Every simulation attribute should be traceable back to measurable cricket statistics.

The platform should always be able to answer:

"Why does this player have this rating?"

using historical evidence.

---

# Long-Term Vision

The Cricket Knowledge Model should support:

- Historical ICC data
- Domestic competitions
- IPL
- PSL
- BBL
- CPL
- The Hundred
- International cricket
- Women's cricket

without changing the simulation engine.

Only the knowledge changes.

The engine remains stable.
