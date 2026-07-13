import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../test";

import { InningsOrder } from "./InningsOrder";
import { MatchOrder } from "./MatchOrder";

describe("MatchOrder", () => {
  it("should expose first innings", () => {
    const first = new InningsOrder(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    const second = new InningsOrder(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    const order = new MatchOrder(first, second);

    expect(order.getFirstInnings()).toBe(first);
  });

  it("should expose second innings", () => {
    const first = new InningsOrder(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    const second = new InningsOrder(
      TeamBuilder.standard().build(),
      TeamBuilder.standard().build(),
    );

    const order = new MatchOrder(first, second);

    expect(order.getSecondInnings()).toBe(second);
  });
});
