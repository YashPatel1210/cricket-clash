# Domain Model

Version: 1.0

Status: Draft

Owner: Cricket Clash

Related Documents:
- GDD/00-Vision.md
- GDD/01-Gameplay-Loop.md
- GDD/02-Match-Environment.md
- GDD/03-Draft-System.md

---

# Purpose

This document defines the core domain model of Cricket Clash.

It identifies the major business concepts (domain objects), their relationships, ownership, and responsibilities.

Every class created inside the engine must originate from this document.

---

# Design Philosophy

The engine is built using Domain-Driven Design (DDD).

Objects should represent real cricket concepts rather than technical implementation details.

Examples:

✓ Match

✓ Team

✓ Player

✓ Innings

✓ Ball

✗ Manager

✗ Helper

✗ Utils

Business concepts come first.

---

# Core Domains

The project is divided into several business domains.

## Game Domain

Responsible for:

- Game
- Tournament
- Match

---

## Draft Domain

Responsible for:

- Draft
- Draft Pack
- Draft Director
- Team Generator
- Draft Quality

---

## Player Domain

Responsible for:

- Player
- Player Instance
- Player Attributes
- Daily Form
- Traits
- Fitness

---

## Match Domain

Responsible for:

- Match
- Innings
- Over
- Ball
- Toss
- Scoreboard

---

## Environment Domain

Responsible for:

- Match Environment
- Stadium
- Pitch
- Weather

---

## AI Domain

Responsible for:

- Draft Director AI
- Team Generator AI
- Captain AI
- Commentary AI (Future)

---

## Simulation Domain

Responsible for:

- Match Engine
- Probability Engine
- Event Bus
- RNG
- Rules

---

# Entity Overview

## Player

Represents a real cricketer.

Contains permanent information.

Examples:

- Name
- Country
- Role
- Base Attributes
- Traits

A Player never stores match-specific state.

---

## Player Instance

Represents one player's state during a single match.

Contains:

- Runs
- Balls Faced
- Confidence
- Fatigue
- Momentum
- Strike Rate

Player Instances are created when a match starts and destroyed when it ends.

---

## Team

Represents one competing side.

Contains:

- Playing XI
- Captain
- Batting Order

A Team owns Player Instances, not Players.

---

## Match

Represents one complete cricket match.

Owns:

- Teams
- Match Context
- Scoreboard
- Innings
- Toss

---

## Match Context

Contains everything required to simulate a match.

Examples:

- Format
- Rules
- Environment
- Random Seed
- Current State

Every subsystem receives Match Context rather than individual values.

---

## Match Environment

Represents all shared external conditions.

Contains:

- Stadium
- Pitch
- Weather
- Temperature
- Humidity
- Wind
- Dew
- Boundary Size
- Outfield

Both teams always share the same Match Environment.

---

## Draft

Represents the drafting session before a match.

Contains:

- Draft Packs
- Draft Progress
- Draft Quality

---

## Draft Pack

Represents one generated Playing XI offered to the player.

Contains realistic role distribution.

---

## Captain

Represents tactical leadership.

Responsible for:

- Toss decisions
- Bowling rotation
- Tactical aggression

---

# Ownership Rules

| Object | Owned By |
|---------|----------|
| Match | Game |
| Team | Match |
| Match Context | Match |
| Match Environment | Match Context |
| Scoreboard | Match |
| Innings | Match |
| Over | Innings |
| Ball | Over |
| Player Instance | Team |
| Batting Order | Team |
| Captain | Team |
| Draft | Match |
| Draft Pack | Draft |

---

# One Source of Truth

Every important value has one owner.

Examples:

| Data | Owner |
|------|-------|
| Score | Scoreboard |
| Runs | Player Instance |
| Confidence | Player Instance |
| Match Format | Match Context |
| Weather | Match Environment |
| Pitch | Match Environment |

Data should never be duplicated.

---

# Aggregate Boundaries

Aggregate: Match

Contains:

- Teams
- Innings
- Scoreboard
- Match Context

---

Aggregate: Team

Contains:

- Player Instances
- Captain
- Batting Order

---

Aggregate: Draft

Contains:

- Draft Packs
- Draft Quality

---

Aggregate: Player

Contains:

- Attributes
- Traits
- Daily Form

---

# Static vs Dynamic Data

## Static

Rarely changes.

Examples:

- Player Name
- Country
- Batting Style
- Bowling Style
- Base Attributes

---

## Dynamic (Draft)

Changes only during drafting.

Examples:

- Draft Progress
- Draft Quality
- Remaining Picks

---

## Dynamic (Match)

Changes every ball.

Examples:

- Runs
- Wickets
- Confidence
- Momentum
- Fatigue

---

# Design Rules

1. Every class must belong to one domain.

2. Every piece of data must have a single owner.

3. Match-specific state must never be stored in Player.

4. The engine must operate on Player Instances.

5. Business concepts are preferred over technical concepts.

---

## Test Infrastructure

The simulation engine includes dedicated test builders to simplify the creation
of domain objects during unit testing.

Current builders:

- PlayerBuilder
- TeamBuilder (planned)

These builders are used exclusively in tests and are not part of the production
domain model.

---

# Future Extensions

This model is designed to support:

- T20
- ODI
- Test
- IPL
- Legends
- Women's Cricket
- Community Tournaments
- Custom Rule Sets

without changing the engine architecture.