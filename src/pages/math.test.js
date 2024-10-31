// math.test.js
import { test, expect } from "@jest/globals";

// src/pages/math.test.js
const add = (a, b) => a + b;

test("adds 1 + 2 to equal 3", () => {
  expect(add(1, 2)).toBe(3);
});
