import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";

import { Over } from "./Over";
import { OverResult } from "./OverResult";

describe("OverResult", () => {
  it("should create an over result", () => {
    const result = new OverResult(
      new Over([]),
      InningsBuilder.standard().build(),
    );

    expect(result).toBeDefined();
  });

  it("should expose over", () => {
    const over = new Over([]);

    const result = new OverResult(over, InningsBuilder.standard().build());

    expect(result.getOver()).toBe(over);
  });

  it("should expose innings", () => {
    const innings = InningsBuilder.standard().build();

    const result = new OverResult(new Over([]), innings);

    expect(result.getInnings()).toBe(innings);
  });
});
