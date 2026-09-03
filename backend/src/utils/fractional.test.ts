import test from "node:test";
import assert from "node:assert";
import { computePosition, needsRebalance, rebalancePositions } from "./fractional";

test("computePosition", async (t) => {
  await t.test("both null", () => {
    assert.strictEqual(computePosition(null, null), 1000.0);
  });
  await t.test("prevPos null", () => {
    assert.strictEqual(computePosition(null, 2000), 1000.0);
  });
  await t.test("nextPos null", () => {
    assert.strictEqual(computePosition(1000, null), 2000.0);
  });
  await t.test("insert between", () => {
    assert.strictEqual(computePosition(1000, 2000), 1500.0);
  });
});

test("needsRebalance", async (t) => {
  await t.test("gap >= 1e-6", () => {
    assert.strictEqual(needsRebalance([1000, 1000.00001, 2000]), false);
  });
  await t.test("gap < 1e-6", () => {
    assert.strictEqual(needsRebalance([1000, 1000 + 1e-7, 2000]), true);
  });
});

test("rebalancePositions", async (t) => {
  await t.test("generates n positions", () => {
    const pos = rebalancePositions(3);
    assert.deepStrictEqual(pos, [1000, 2000, 3000]);
  });
});
