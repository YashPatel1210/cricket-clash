# ADR-003: Repository and Query Architecture

## Status

Accepted

---

## Context

The Draft System requires access to a large collection of players.

Future features will require filtering players based on many different criteria, including:

- Country
- Role
- Current Form
- Traits
- Injuries
- Tournament
- Already Drafted Players
- User Restrictions
- Match Format
- Future Events

If every filtering combination is implemented inside the repository, the interface will quickly become large and difficult to maintain.

Example:

- findByCountry()
- findByRole()
- findByCountryAndRole()
- findEligiblePlayers()
- findAvailablePlayers()
- findPlayersForDraft()
- findPlayersForTournament()

This approach mixes data access with business rules.

---

## Decision

Repositories are responsible only for retrieving domain entities.

The PlayerRepository interface remains intentionally small.

Current responsibilities:

- getAll()
- findById()

The repository does not contain cricket-specific business logic.

Filtering, eligibility and draft-specific rules belong to PlayerPool.

Architecture:

DraftGenerator
        │
        ▼
PlayerPool
        │
        ▼
PlayerRepository
        │
        ▼
Player Data Source

---

## Rationale

Separating responsibilities provides several benefits.

Repository:

- Knows where data comes from.
- Does not know how the data will be used.

PlayerPool:

- Knows cricket rules.
- Applies business filters.
- Produces eligible players for drafting.

DraftGenerator:

- Knows how to build a Playing XI.
- Does not know where players are stored.

This separation follows the Single Responsibility Principle.

---

## Consequences

### Advantages

- Small repository interface
- Easy to replace storage implementation
- Business logic remains inside the domain
- Unlimited filtering combinations without changing repository APIs
- Easier testing using InMemoryPlayerRepository

### Disadvantages

- Additional abstraction (PlayerPool)
- Slightly more objects in the architecture

---

## Future Evolution

Future implementations may include:

- JsonPlayerRepository
- SqlPlayerRepository
- SupabasePlayerRepository
- ApiPlayerRepository

No changes should be required in DraftGenerator.

PlayerPool may later support fluent queries, for example:

PlayerPool
    .from(repository)
    .exclude(draftedPlayers)
    .country(Country.INDIA)
    .role(PlayerRole.BATTER)
    .formAbove(85)
    .build()

---

## Decision Summary

Repositories retrieve data.

PlayerPool applies business rules.

DraftGenerator creates Playing XI.

Each component owns a single responsibility.