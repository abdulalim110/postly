import assert from "node:assert/strict";
import test from "node:test";
import { runBehaviorSuite } from "./support/behaviorSuite.js";

for (const strategy of ["naive", "dataloader"]) {
  test(
    `D08 behavior suite: ${strategy}`,
    { timeout: 60_000 },
    async () => {
      const result = await runBehaviorSuite(strategy);
      assert.equal(result.passed, true);
      assert.equal(result.checks.length, 15);
    },
  );
}
