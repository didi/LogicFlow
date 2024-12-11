import { isArray } from 'lodash-es'
import Mousetrap, { MousetrapInstance } from 'mousetrap'
import LogicFlow from '../LogicFlow'

export * from './shortcut'

export type Action = 'keypress' | 'keydown' | 'keyup'
export type Handler = (e: KeyboardEvent) => void

export interface KeyboardDef {
  enabled: boolean
  shortcuts?: Array<{
    keys: string | string[]
    callback: Handler
    action?: Action
  }>
}

export interface KeyboardOptions {
  lf: LogicFlow
  keyboard?: KeyboardDef
}

export class Keyboard {
  public readonly mousetrap: MousetrapInstance
  public options: KeyboardOptions
  private readonly target: HTMLElement

  constructor(options: KeyboardOptions) {
    if (!options.keyboard) {
      options.keyboard = { enabled: false }
    }
    this.options = options
    const { lf } = options
    this.target = lf.container
    this.mousetrap = new Mousetrap(this.target)
    // 默认开启快捷键，且不是静默模式时enable
    if (options.keyboard.enabled && !lf.options.isSilentMode) {
      this.enable(true)
    }
  }

  initShortcuts() {
    const { shortcuts } = this.options.keyboard ?? {}
    if (shortcuts) {
      if (isArray(shortcuts)) {
        shortcuts.forEach(({ keys, callback, action }) =>
          this.on(keys, callback, action),
        )
      } else {
        const { keys, callback, action } = shortcuts
        this.on(keys, callback, action)
      }
    }
  }

  on(keys: string | string[], callback: Handler, action?: Action) {
    this.mousetrap.bind(this.getKeys(keys), callback, action)
  }

  get disabled() {
    return this.options?.keyboard?.enabled !== true
  }

  off(keys: string | string[], action?: Action) {
    this.mousetrap.unbind(this.getKeys(keys), action)
  }

  enable(force: boolean) {
    if (this.disabled || force) {
      if (this.options.keyboard) {
        this.options.keyboard.enabled = true
      }
      if (this.target instanceof HTMLElement) {
        this.target.setAttribute('tabindex', '-1')
        // 去掉节点被选中时container出现的边框
        this.target.style.outline = 'none'
      }
    }
  }

  disable() {
    if (!this.disabled) {
      if (this.options.keyboard) {
        this.options.keyboard.enabled = false
      }
      if (this.target instanceof HTMLElement) {
        this.target.removeAttribute('tabindex')
      }
    }
  }

  destroy() {
    this.mousetrap.reset()
  }

  private getKeys(keys: string | string[]) {
    return (Array.isArray(keys) ? keys : [keys]).map((key) =>
      this.formatKey(key),
    )
  }

  protected formatKey(key: string) {
    return key
      .toLowerCase()
      .replace(/\s/g, '')
      .replace('delete', 'del')
      .replace('cmd', 'command')
  }
}

export default Keyboard
