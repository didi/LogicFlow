import Mousetrap, { MousetrapInstance } from 'mousetrap'
import { forEach, isArray } from 'lodash-es'
import LogicFlow from '..'

export class Keyboard {
  private target: HTMLElement
  readonly mousetrap: MousetrapInstance
  options: Required<Keyboard.Options>

  constructor(options: Keyboard.Options) {
    const { lf } = options
    if (!options.keyboard) {
      options.keyboard = { enabled: false }
    }
    this.options = options as Required<Keyboard.Options>
    this.target = lf.container
    this.mousetrap = new Mousetrap(this.target)

    if (options.keyboard?.enabled) {
      this.enable(true)
    }
  }

  protected formatKey(key: string) {
    return key
      .toLowerCase()
      .replace(/\s/g, '')
      .replace('delete', 'del')
      .replace('cmd', 'command')
  }

  private getKeys(keys: string | string[]) {
    return (isArray(keys) ? keys : [keys]).map((key) => this.formatKey(key))
  }

  get disabled() {
    return this.options.keyboard?.enabled !== true
  }

  on(
    keys: string | string[],
    callback: Keyboard.HandlerFunc,
    action?: Keyboard.ActionType,
  ) {
    this.mousetrap.bind(this.getKeys(keys), callback, action)
  }

  off(keys: string | string[], action?: Keyboard.ActionType) {
    this.mousetrap.unbind(this.getKeys(keys), action)
  }

  enable(force: boolean) {
    if (this.disabled || force) {
      this.options.keyboard.enabled = true
      if (this.target instanceof HTMLElement) {
        this.target.setAttribute('tabindex', '-1')
        // 去掉节点被选中时 container 出现的边框
        this.target.style.outline = 'none'
      }
    }
  }

  disable() {
    if (!this.disabled) {
      this.options.keyboard.enabled = false
      if (this.target instanceof HTMLElement) {
        this.target.removeAttribute('tabindex')
      }
    }
  }

  initShortcuts() {
    const { shortcuts } = this.options.keyboard
    if (shortcuts) {
      if (isArray(shortcuts)) {
        forEach(shortcuts, ({ keys, callback, action }) => {
          this.on(keys, callback, action)
        })
      } else {
        const { keys, callback, action } = shortcuts
        this.on(keys, callback, action)
      }
    }
  }
}

export namespace Keyboard {
  export type ActionType = 'keypress' | 'keydown' | 'keyup'
  export type HandlerFunc = (e: KeyboardEvent) => void

  export interface Shortcut {
    keys: string | string[]
    callback: HandlerFunc
    action?: ActionType
  }

  export interface KeyboardDef {
    enabled: boolean
    shortcuts?: Shortcut | Shortcut[]
  }

  export interface Options {
    lf: LogicFlow
    keyboard?: KeyboardDef
  }
}

export default Keyboard
