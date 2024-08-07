import { BaseNodeModel, GraphModel } from '@logicflow/core'
import {
  defineComponent,
  h,
  reactive,
  isVue3,
  Teleport,
  markRaw,
  Fragment,
} from 'vue-demi'

let active = false
const items = reactive<{ [key: string]: any }>({})

export function connect(
  id: string,
  component: any,
  container: HTMLDivElement,
  node: BaseNodeModel,
  graph: GraphModel,
) {
  if (active) {
    items[id] = markRaw(
      defineComponent({
        render: () =>
          h(Teleport, { to: container } as any, [
            h(component, { node, graph }),
          ]),
        provide: () => ({
          getNode: () => node,
          getGraph: () => graph,
        }),
      }),
    )
  }
}

export function disconnect(id: string) {
  if (active) {
    delete items[id]
  }
}

export function isActive() {
  return active
}

export function getTeleport(): any {
  if (!isVue3) {
    throw new Error('teleport is only available in Vue3')
  }
  active = true

  return defineComponent({
    setup() {
      return () =>
        h(
          Fragment,
          {},
          Object.keys(items).map((id) => h(items[id])),
        )
    },
  })
}
