import { createElement as h } from 'preact/compat'
import { forEach, toPairs } from 'lodash-es'

export type IPathProps = {
  d: string
  [key: string]: any
}

export function Path(props: IPathProps): h.JSX.Element {
  const attrs: Record<string, any> = {
    d: '',
  }
  forEach(toPairs(props), ([k, v]: [key: string, v: any]) => {
    if (k === 'style' || typeof v !== 'object') {
      attrs[k] = v
    }
  })

  return <path {...attrs} />
}

export default Path
