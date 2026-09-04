import test from "node:test";
import assert from "node:assert";
import { computePosition, needsRebalance, rebalancePositions } from "./fractional";

test("Task Movement & Ordering Edge Cases", async (t) => {
  await t.test("moving to an empty column (both null) returns base index 1000", () => {
    const pos = computePosition(null, null);
    assert.strictEqual(pos, 1000.0);
  });

  await t.test("moving to position 0 (insert before first item) yields half of first position", () => {
    const firstItemPos = 1000.0;
    const newPos = computePosition(null, firstItemPos);
    assert.strictEqual(newPos, 500.0);
    assert.ok(newPos < firstItemPos, "New position must be strictly less than first item");
  });

  await t.test("moving to last position (insert after last item) yields last + 1000", () => {
    const lastItemPos = 3000.0;
    const newPos = computePosition(lastItemPos, null);
    assert.strictEqual(newPos, 4000.0);
    assert.ok(newPos > lastItemPos, "New position must be strictly greater than last item");
  });

  await t.test("moving between two items yields midpoint", () => {
    const posA = 1000.0;
    const posB = 2000.0;
    const mid = computePosition(posA, posB);
    assert.strictEqual(mid, 1500.0);
    assert.ok(mid > posA && mid < posB);
  });

  await t.test("moving within a column with 1 item", () => {
    const existing = 1000.0;
    const beforeFirst = computePosition(null, existing);
    const afterLast = computePosition(existing, null);
    assert.strictEqual(beforeFirst, 500.0);
    assert.strictEqual(afterLast, 2000.0);
  });

  await t.test("rapid successive moves in same gap trigger rebalance and produce clean order", () => {
    let p1 = 1000.0;
    let p2 = 2000.0;
    const positions = [p1, p2];

    // Repeatedly insert into the first gap until gap is below 1e-6 (32 halvings of 1000 -> ~2.3e-7)
    for (let i = 0; i < 32; i++) {
      const nextMid = computePosition(p1, p2);
      p2 = nextMid;
      positions.splice(1, 0, nextMid);
    }

    // Gaps must have become smaller than 1e-6
    const shouldRebalance = needsRebalance(positions);
    assert.strictEqual(shouldRebalance, true, "Rapid inserts must trigger needsRebalance");

    const rebalanced = rebalancePositions(positions.length);
    assert.strictEqual(rebalanced.length, positions.length);
    assert.strictEqual(needsRebalance(rebalanced), false);

    // Verify all rebalanced positions are strictly ascending and integers >= 1000
    for (let i = 1; i < rebalanced.length; i++) {
      assert.ok(rebalanced[i] > rebalanced[i - 1], "Positions must be strictly increasing");
      assert.strictEqual(rebalanced[i] - rebalanced[i - 1], 1000, "Gap must be standard 1000");
    }
  });
});
