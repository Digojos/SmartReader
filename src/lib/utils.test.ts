import { describe, expect, it, vi } from "vitest";
import {
  getMasteryColor,
  getMasteryLabel,
  getNextReviewDate,
  getReadingTime,
} from "./utils";

describe("utils", () => {
  it("calculates reading time based on 200 words per minute", () => {
    expect(getReadingTime(0)).toBe(0);
    expect(getReadingTime(1)).toBe(1);
    expect(getReadingTime(200)).toBe(1);
    expect(getReadingTime(201)).toBe(2);
  });

  it("caps mastery label and color at max level", () => {
    expect(getMasteryLabel(0)).toBe("New");
    expect(getMasteryLabel(5)).toBe("Expert");
    expect(getMasteryLabel(999)).toBe("Expert");

    expect(getMasteryColor(0)).toBe("bg-gray-100 text-gray-700");
    expect(getMasteryColor(5)).toBe("bg-purple-100 text-purple-700");
    expect(getMasteryColor(999)).toBe("bg-purple-100 text-purple-700");
  });

  it("returns next review date using spaced repetition intervals", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T10:00:00.000Z"));

    const dateFor0 = getNextReviewDate(0);
    const dateFor2 = getNextReviewDate(2);
    const dateFor5 = getNextReviewDate(5);

    expect(dateFor0.toISOString().slice(0, 10)).toBe("2026-05-01");
    expect(dateFor2.toISOString().slice(0, 10)).toBe("2026-05-04");
    expect(dateFor5.toISOString().slice(0, 10)).toBe("2026-06-01");

    vi.useRealTimers();
  });
});
