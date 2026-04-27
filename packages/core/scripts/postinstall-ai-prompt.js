#!/usr/bin/env node

const RESET = '\x1b[0m'
const REMINDER_STYLE = '\x1b[1m\x1b[43m\x1b[30m' // bold, yellow bg, black fg

const AGENT_RULES = `<!-- BEGIN:logicflow-agent-rules -->
# LogicFlow Agent Rules

LogicFlow documentation is available at:

- \`node_modules/@logicflow/core/dist/docs/\`

Package roles:

- \`@logicflow/core\`: core graph editor runtime, including canvas, nodes, edges, models, events, rendering, themes, and basic interactions.
- \`@logicflow/extension\`: official plugins for common product features.
- \`@logicflow/layout\`: official layout plugins for automatic graph layout.

The docs for \`@logicflow/extension\` and \`@logicflow/layout\` are included under:

- \`node_modules/@logicflow/core/dist/docs/tutorial/extension/\`

Before implementing any LogicFlow feature, check the local docs first to see whether LogicFlow already provides a built-in, extension, or layout capability. If it does, prefer the documented official capability instead of reimplementing it from scratch.

If an official package is needed but not installed, ask the user before installing it.
<!-- END:logicflow-agent-rules -->`

const REMINDER_LINES = [
  '请将下方的规则复制给你的 AI Agent，让 AI Agent 可以更了解 LogicFlow。',
  '您还可以在 README 和官网的 AI 编程章节找到此规则',
]

function shouldUseAnsi() {
  if (!process.stdout.isTTY) return false
  if (process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== '')
    return false
  if (process.env.TERM === 'dumb') return false
  if (process.env.CI === 'true' && !process.env.FORCE_COLOR) return false
  return true
}

function dividerWidth() {
  const c = process.stdout.columns
  if (typeof c === 'number' && Number.isFinite(c) && c > 0) {
    return Math.min(c, 120)
  }
  return 80
}

function dividerLine() {
  return '─'.repeat(dividerWidth())
}

function printReminder() {
  const useAnsi = shouldUseAnsi()
  for (const line of REMINDER_LINES) {
    if (useAnsi) {
      process.stdout.write(`${REMINDER_STYLE}${line}${RESET}\n`)
    } else {
      process.stdout.write(`${line}\n`)
    }
  }
}

printReminder()
console.log(dividerLine())
console.log(AGENT_RULES)
