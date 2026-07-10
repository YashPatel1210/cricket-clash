import { describe, expect, it } from "vitest";

import { InMemoryPlayerRepository } from "./InMemoryPlayerRepository";
import { PlayerBuilder } from "../../test";

describe("InMemoryPlayerRepository", () => {
  it("should return all players", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const bumrah = PlayerBuilder
      .bowler()
      .named("Jasprit Bumrah")
      .build();

    const repository = new InMemoryPlayerRepository([
      virat,
      bumrah,
    ]);

    // Act
    const players = repository.getAll();

    // Assert
    expect(players).toHaveLength(2);
    expect(players).toContain(virat);
    expect(players).toContain(bumrah);
  });

  it("should find player by id", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const repository = new InMemoryPlayerRepository([
      virat,
    ]);

    // Act
    const player = repository.findById(virat.id);

    // Assert
    expect(player).toBe(virat);
  });

  it("should return undefined when player does not exist", () => {
    // Arrange
    const repository = new InMemoryPlayerRepository([]);

    // Act
    const player = repository.findById("unknown-player");

    // Assert
    expect(player).toBeUndefined();
  });

  it("should return an empty collection when repository has no players", () => {
    // Arrange
    const repository = new InMemoryPlayerRepository([]);

    // Act
    const players = repository.getAll();

    // Assert
    expect(players).toHaveLength(0);
  });
});