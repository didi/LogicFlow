export class IDs {
  private _ids: Set<string>

  constructor() {
    globalThis._ids = this
    this._ids = new Set()
  }

  generateId() {
    return 'xxxxxxx'.replace(/[x]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  next() {
    let id = this.generateId()
    while (this._ids.has(id)) {
      id = this.generateId()
    }
    this._ids.add(id)
    return id
  }
}

const ids = globalThis?._ids || new IDs()

export function getBpmnId(): string {
  return ids.next()
}
