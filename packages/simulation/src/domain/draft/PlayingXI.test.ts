import { describe, expect, it } from "vitest";

import { DraftOption } from "./DraftOption";
import { DraftOptionState } from "./DraftOptionState";
import { DraftOptionDisableReason } from "./DraftOptionDisableReason";
import { PlayingXI } from "./PlayingXI";
import { PlayerBuilder } from "../../test";

describe("PlayingXI", () => {
  it("should create a valid playing eleven", () => {
    const options = Array.from({ length: 11 }, () =>
      new DraftOption(
        PlayerBuilder.batter().build(),
      ),
    );

    const xi = new PlayingXI(options);

    expect(xi.size()).toBe(11);
  });

  it("should reject fewer than eleven players", () => {
  const options = Array.from({ length: 10 }, () =>
    new DraftOption(
      PlayerBuilder.batter().build(),
    ),
  );

  expect(() => new PlayingXI(options))
    .toThrow();
});

it("should reject more than eleven players", () => {
  const options = Array.from({ length: 12 }, () =>
    new DraftOption(
      PlayerBuilder.batter().build(),
    ),
  );

  expect(() => new PlayingXI(options))
    .toThrow();
});

it("should return available draft options", () => {
  // Arrange
  const availableOptions = Array.from(
    { length: 9 },
    () => new DraftOption(
      PlayerBuilder.batter().build(),
    ),
  );

  const disabledOptions = Array.from(
  { length: 2 },
  () =>
    new DraftOption(
      PlayerBuilder.batter().build(),
      DraftOptionState.ALREADY_SELECTED,
    ),
);

  const xi = new PlayingXI([
    ...availableOptions,
    ...disabledOptions,
  ]);

  // Act
  const available = xi.getAvailableOptions();
  const disabled = xi.getDisabledOptions();

  // Assert
  expect(available).toHaveLength(9);
  expect(disabled).toHaveLength(2);
});
});