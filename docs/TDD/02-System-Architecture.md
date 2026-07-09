# System Architecture

Version: 1.0

Status: Draft

Owner: Cricket Clash

Related Documents:

- TDD/01-Domain-Model.md
- GDD/00-Vision.md

---

# Purpose

This document defines the overall architecture of Cricket Clash.

It explains how major systems collaborate while remaining independent.

---

# Architectural Style

Cricket Clash follows:

- Domain Driven Design (DDD)
- Event Driven Architecture (EDA)
- Clean Architecture
- Data Driven Design
- Deterministic Simulation

These architectural styles work together to produce a scalable simulation platform.

---

# High-Level Architecture

```
                 React Web App

                       │

                 Application Layer

                       │

                Cricket Engine API

                       │

         ┌─────────────┼─────────────┐

         │             │             │

      Draft        Match         Replay

      Domain       Domain        Domain

         │             │             │

      Shared Domain Objects

         │

     Data Layer
```

---

# Major Bounded Contexts

## Draft

Responsible for:

- Draft Packs
- Team Generator
- Draft Director
- Draft Quality

---

## Match

Responsible for:

- Toss
- Innings
- Overs
- Balls
- Scoreboard

---

## Replay

Responsible for:

- Match Replay
- Timeline
- Event Playback

---

## Commentary

Future context.

Consumes simulation events.

Produces commentary.

---

## Analytics

Responsible for:

- Statistics
- Win Probability
- Match Story

---

## Shared

Contains common concepts used by every bounded context.

Examples:

- Player
- MatchContext
- Country
- MatchFormat

---

# Engine Layers

The engine is divided into four logical layers.

## Domain Layer

Contains business objects.

Examples:

- Match
- Team
- Player
- Ball

---

## Application Layer

Coordinates use cases.

Examples:

- Start Match
- Generate Draft
- Simulate Ball

---

## Infrastructure Layer

Responsible for:

- RNG
- Persistence (future)
- Configuration

---

## Presentation Layer

Outside the engine.

Implemented by React.

---

# Event Flow

The engine communicates using events.

Example:

Ball Started

↓

Ball Delivered

↓

Shot Played

↓

Runs Scored

↓

Scoreboard Updated

↓

Confidence Updated

↓

Commentary

↓

Replay

↓

Analytics

Every subsystem reacts to events.

No subsystem directly controls another.

---

# Dependency Rules

Presentation

↓

Application

↓

Domain

Infrastructure supports all layers.

Domain must never depend on React.

Domain must never depend on infrastructure.

---

# Data Flow

Player Database

↓

Draft

↓

Team

↓

Player Instance

↓

Simulation

↓

Events

↓

Statistics

↓

Replay

---

# Architectural Principles

- Single Responsibility Principle
- One Source of Truth
- Event Driven Communication
- Data Driven Content
- Deterministic Simulation

---

# Future Expansion

The architecture should support:

- Mobile Apps
- Dedicated Match Servers
- AI vs AI Simulation
- Tournament Services
- Community Mods

without requiring major engine redesign.