# Engine Architecture

## Mission

`@logicflow/engine` executes graph-defined workflows in JavaScript environments. It is intentionally separate from the editor runtime so the same execution model can run in browser or Node.js contexts without depending on `@logicflow/core`.

If a change affects scheduling, node execution, resume or interrupt semantics, recorder behavior, or environment-specific execution support, it belongs here.

## What This Package Owns

- the `Engine` entry class and node registration API
- workflow loading from graph-like data
- execution scheduling and sequencing
- node execution lifecycle and base node protocol
- execution records and recorder integration
- browser and Node platform abstractions

## What This Package Does Not Own

- graph editing or rendering
- plugin UI or BPMN editor features
- framework-specific node rendering

This package should stay usable in environments that never load the editor.

## Code Map

### Public entry

- `src/index.ts`: `Engine` class, default node registration, high-level load and execute APIs.

### Workflow runtime

- `src/FlowModel.ts`: transforms graph data into executable node connectivity, tracks start nodes, and coordinates execution creation.
- `src/Scheduler.ts`: action scheduling, queueing, and execution progress orchestration.

### Node protocol

- `src/nodes/base.ts`: base execution-node contract.
- `src/nodes/start.ts` and `src/nodes/task.ts`: built-in node implementations.

### Persistence and observability

- `src/recorder`: execution record storage and retrieval.
- `src/EventEmitter.ts`: engine event emission.

### Environment support and helpers

- `src/platform/browser` and `src/platform/node`: environment-specific behavior.
- `src/constant`: events, error codes, and related constants.
- `src/utils`: id generation and support helpers.

## Stable Runtime Flow

The execution path is intentionally straightforward:

1. `Engine` registers node constructors by type.
2. `Engine.load` creates a `FlowModel` and loads graph data.
3. `FlowModel` converts nodes and edges into executable node connectivity.
4. `FlowModel` seeds execution from start nodes or a requested node.
5. `Scheduler` manages the action queue and drives node execution.
6. Recorder integration captures execution history when configured.

Preserve this separation when modifying the package. Loading, scheduling, and node execution should remain distinct responsibilities.

## Invariants

- The engine remains independent from `@logicflow/core`.
- Node types must be registered before a workflow relying on them can execute.
- Execution requests on a single `FlowModel` are serialized at the run level, even when inner node progression fans out.
- `FlowModel` is responsible for deriving executable connectivity from graph data; downstream runtime code should not need to reinterpret raw edge lists.
- Recorder behavior must remain optional. Execution should still work when no custom recorder is provided.

## Common Change Entry Points

- Change workflow loading or start-node selection: start with `src/FlowModel.ts`.
- Change execution ordering or queue semantics: start with `src/Scheduler.ts`.
- Change what a node can do during execution: start with `src/nodes/base.ts` and the concrete node classes.
- Change execution history behavior: start with `src/recorder`.
- Change environment-specific storage or runtime support: start with `src/platform`.

## Integration Boundaries

The engine commonly consumes graph-shaped data that may originate from LogicFlow, but it should not assume the editor runtime is present. Keep graph import contracts generic enough for browser and Node usage.

If a future change needs editor-specific execution helpers, keep them out of this package unless they are still meaningful without UI concerns.

## Verification Entry

For engine behavior changes, prefer automated tests first:

```sh
cd packages/engine
pnpm test
```

Use `examples/engine-browser-examples` or `examples/engine-node-examples` when the change depends on environment-specific behavior.

## What To Avoid In Future Updates

Do not grow this document into a catalog of every node field or recorder method. Keep it centered on execution ownership, boundaries, and stable entry points.