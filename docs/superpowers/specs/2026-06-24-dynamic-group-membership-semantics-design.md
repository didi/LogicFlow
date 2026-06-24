# DynamicGroup Membership Semantics Design

## Goal

Fix #2052 by making dynamic-group membership updates explicit and predictable. `addNode` should create nodes, drag-and-drop should infer membership from bounds, and explicit group APIs should maintain the single-parent invariant.

## Current Problem

DynamicGroup currently listens to `node:add`, `node:dnd-add`, and `node:drop` with the same handler. That makes programmatic `addNode` do two things at once:

1. create the node;
2. infer group membership from the node bounds.

In #2052, API-loaded child nodes are first created inside an existing group by position, then explicitly attached to the newly created `job_group`. Because `addChild` only updates `nodeGroupMap` and does not remove stale `children` entries from previous groups, `job_child_1` can remain in `group_a.children` while `nodeGroupMap` points to `job_group`. Later, dragging either group can move or reassign the same child unexpectedly.

## Design Principles

1. `node:add` is programmatic creation. It must not infer group membership from bounds.
2. `node:dnd-add` is user drag-in creation. It may infer membership from bounds.
3. `node:drop` is movement of an existing element. It may reparent the dragged element itself based on bounds.
4. Dragging a group moves that group and its current children. Dropping the group may reparent the group itself, but must not detach or attach the group's descendants.
5. `group.addChild(childId)` is an explicit membership API and must preserve one direct parent per child.

## API Semantics

### Programmatic Add

`lf.addNode(...)` or `graphModel.addNode(...)` with the default `node:add` event creates a node only. If the new node is a dynamic-group with explicit `children`, DynamicGroup syncs those children into `nodeGroupMap`; it does not infer the group node's parent from its bounds.

### Dnd Add

DndPanel uses `lf.addNode(..., EventType.NODE_DND_ADD, event)`. This remains a spatial interaction: if the new node's bounds are inside a group and the target group accepts it, the node is added to that group.

### Node Drop

Dropping a normal node recalculates that node's direct parent from bounds.

Dropping a group recalculates only the group's own parent. The group's internal children remain owned by the group, and are not detached from or attached to any other group during the group drop.

### Explicit Add Child

`DynamicGroupNodeModel.addChild(id)` emits `group:add-node`. The plugin handles that event as the canonical explicit membership path:

- remove the child from any previous owner in `nodeGroupMap`;
- remove stale references to that child from other group `children` sets;
- set `nodeGroupMap.set(childId, groupId)`.

## Implementation Plan

### Task 1: Tests First

Modify `packages/extension/__test__/dynamic-group/membership.test.ts`.

- Add a helper to emit `node:dnd-add`.
- Add a test proving default `lf.addNode` does not auto-append by bounds.
- Add a test proving `node:dnd-add` does auto-append by bounds.
- Add a test proving group drop reparents only the group, not its descendants.
- Add a #2052 regression test for batch `graphModel.addNode` plus explicit `addChild`.

Expected first run: the new tests fail against current implementation.

### Task 2: Split Event Handlers

Modify `packages/extension/src/dynamic-group/index.ts`.

- Replace the shared `onNodeAddOrDrop` handler with separate handlers:
  - `onNodeAdd`
  - `onNodeDndAdd`
  - `onNodeDrop`
- Update event registration and cleanup to bind each handler to its matching event.
- Keep selection drop behavior unchanged.

### Task 3: Separate Membership Operations

Modify `packages/extension/src/dynamic-group/index.ts`.

- Add a helper for syncing explicit group children without bounds inference.
- Add a helper for removing a child from every other group's `children` set.
- Update `onGroupAddNode` to enforce the single-parent invariant.
- Update drop handling so group nodes reparent themselves only; descendants are not reparented.

### Task 4: Verify

Run:

```sh
pnpm test -- --testPathPattern="membership.test"
pnpm test -- --testPathPattern="dynamic-group"
```

Then check lints for touched files.

## Expected Behavior After Fix

In the #2052 scenario:

1. `graphModel.addNode(job_child_1)` does not append `job_child_1` to `group_a` merely because it is inside `group_a` bounds.
2. `job_group.addChild('job_child_1')` makes `job_group` the only direct parent.
3. Dragging `group_a` does not move or reassign `job_child_1`.
4. Dragging `job_group` moves `job_child_1` and `job_child_2`.
# DynamicGroup Membership Semantics Design

## Goal

Fix #2052 by making dynamic-group membership updates explicit and predictable. `addNode` should create nodes, drag-and-drop should infer membership from bounds, and explicit group APIs should maintain the single-parent invariant.

## Current Problem

DynamicGroup currently listens to `node:add`, `node:dnd-add`, and `node:drop` with the same handler. That makes programmatic `addNode` do two things at once:

1. create the node;
2. infer group membership from the node bounds.

In #2052, API-loaded child nodes are first created inside an existing group by position, then explicitly attached to the newly created `job_group`. Because `addChild` only updates `nodeGroupMap` and does not remove stale `children` entries from previous groups, `job_child_1` can remain in `group_a.children` while `nodeGroupMap` points to `job_group`. Later, dragging either group can move or reassign the same child unexpectedly.

## Design Principles

1. `node:add` is programmatic creation. It must not infer group membership from bounds.
2. `node:dnd-add` is user drag-in creation. It may infer membership from bounds.
3. `node:drop` is movement of an existing element. It may reparent the dragged element itself based on bounds.
4. Dragging a group moves that group and its current children. Dropping the group may reparent the group itself, but must not detach or attach the group's descendants.
5. `group.addChild(childId)` is an explicit membership API and must preserve one direct parent per child.

## API Semantics

### Programmatic Add

`lf.addNode(...)` or `graphModel.addNode(...)` with the default `node:add` event creates a node only. If the new node is a dynamic-group with explicit `children`, DynamicGroup syncs those children into `nodeGroupMap`; it does not infer the group node's parent from its bounds.

### Dnd Add

DndPanel uses `lf.addNode(..., EventType.NODE_DND_ADD, event)`. This remains a spatial interaction: if the new node's bounds are inside a group and the target group accepts it, the node is added to that group.

### Node Drop

Dropping a normal node recalculates that node's direct parent from bounds.

Dropping a group recalculates only the group's own parent. The group's internal children remain owned by the group, and are not detached from or attached to any other group during the group drop.

### Explicit Add Child

`DynamicGroupNodeModel.addChild(id)` emits `group:add-node`. The plugin handles that event as the canonical explicit membership path:

- remove the child from any previous owner in `nodeGroupMap`;
- remove stale references to that child from other group `children` sets;
- set `nodeGroupMap.set(childId, groupId)`.

## Implementation Plan

### Task 1: Tests First

Modify `packages/extension/__test__/dynamic-group/membership.test.ts`.

- Add a helper to emit `node:dnd-add`.
- Add a test proving default `lf.addNode` does not auto-append by bounds.
- Add a test proving `node:dnd-add` does auto-append by bounds.
- Add a test proving group drop reparents only the group, not its descendants.
- Add a #2052 regression test for batch `graphModel.addNode` plus explicit `addChild`.

Expected first run: the new tests fail against current implementation.

### Task 2: Split Event Handlers

Modify `packages/extension/src/dynamic-group/index.ts`.

- Replace the shared `onNodeAddOrDrop` handler with separate handlers:
  - `onNodeAdd`
  - `onNodeDndAdd`
  - `onNodeDrop`
- Update event registration and cleanup to bind each handler to its matching event.
- Keep selection drop behavior unchanged.

### Task 3: Separate Membership Operations

Modify `packages/extension/src/dynamic-group/index.ts`.

- Add a helper for syncing explicit group children without bounds inference.
- Add a helper for removing a child from every other group's `children` set.
- Update `onGroupAddNode` to enforce the single-parent invariant.
- Update drop handling so group nodes reparent themselves only; descendants are not reparented.

### Task 4: Verify

Run:

```sh
pnpm test -- --testPathPattern="membership.test"
pnpm test -- --testPathPattern="dynamic-group"
```

Then check lints for touched files.

## Expected Behavior After Fix

In the #2052 scenario:

1. `graphModel.addNode(job_child_1)` does not append `job_child_1` to `group_a` merely because it is inside `group_a` bounds.
2. `job_group.addChild('job_child_1')` makes `job_group` the only direct parent.
3. Dragging `group_a` does not move or reassign `job_child_1`.
4. Dragging `job_group` moves `job_child_1` and `job_child_2`.
