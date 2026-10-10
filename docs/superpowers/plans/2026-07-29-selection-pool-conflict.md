# Selection Pool Conflict Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix #2418 so `SelectionSelect` works with `PoolElements` and preserves parent-container selection deduplication.

**Architecture:** Keep the fix local to `SelectionSelect`. Add an internal parent-container helper that supports legacy `Group`, `DynamicGroup`, and `PoolElements` without changing public plugin APIs.

**Tech Stack:** TypeScript, Jest jsdom, `@logicflow/core`, `@logicflow/extension`.

## Global Constraints

- Use `pnpm` only.
- Write the failing test before implementation.
- Preserve public API compatibility.
- Do not refactor `graphModel.dynamicGroup` mounting.
- Do not modify Pool/Lane membership semantics.

---

### Task 1: Add Regression Test

**Files:**
- Create: `packages/extension/__test__/selection-select/pool-conflict.test.ts`

**Interfaces:**
- Consumes: `PoolElements`, `SelectionSelect`, `LogicFlow`.
- Produces: failing coverage for `SelectionSelect + PoolElements`.

- [ ] **Step 1: Write the failing test**

Create a jsdom test that renders `pool -> lane -> node`, drives the selection plugin's end-of-drag logic, and asserts `pool` is selected while `lane` and `node` are not.

- [ ] **Step 2: Run RED**

Run: `pnpm test -- packages/extension/__test__/selection-select/pool-conflict.test.ts --runInBand`

Expected: FAIL with `getGroupByNodeId is not a function`.

### Task 2: Implement SelectionSelect Parent Container Lookup

**Files:**
- Modify: `packages/extension/src/components/selection-select/index.ts`

**Interfaces:**
- Consumes: `graphModel.group`, `graphModel.dynamicGroup`.
- Produces: `getParentContainerByNodeId(nodeId: string)` private helper.

- [ ] **Step 1: Add the private helper**

Use optional function checks for `getNodeGroup`, `getGroupByNodeId`, and `getLaneByNodeId`.

- [ ] **Step 2: Replace duplicated inline checks**

Use the helper inside the `elements.forEach` selection filtering branch.

- [ ] **Step 3: Run GREEN**

Run: `pnpm test -- packages/extension/__test__/selection-select/pool-conflict.test.ts --runInBand`

Expected: PASS.

### Task 3: Verify Nearby Regression Coverage

**Files:**
- Existing extension tests.

- [ ] **Step 1: Run pool tests**

Run: `pnpm test -- packages/extension/__test__/pool --runInBand`

Expected: PASS.

- [ ] **Step 2: Run targeted extension build if needed**

Run: `pnpm --filter @logicflow/extension build:esm`

Expected: PASS.
