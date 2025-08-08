import { BaseNodeModel, GraphModel } from '@logicflow/core'
import {
  defineComponent,
  h,
  createApp,
  reactive,
  isVue3,
  Teleport,
  markRaw,
  Fragment,
} from 'vue-demi'

let active = false
const appInstances = new Map<string, InstanceType<any>>()
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

export function disconnect(id: string, flowId: string) {
  if (active) {
    delete items[id]
    const app = appInstances.get(flowId)
    if (app) {
      app.unmount()
      appInstances.delete(flowId)
    }
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
    props: {
      flowId: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      return () => {
        const children: Record<string, any>[] = []
        Object.keys(items).forEach((id) => {
          // https://github.com/didi/LogicFlow/issues/1768
          // 多个不同的VueNodeView都会connect注册到items中，因此items存储了可能有多个flowId流程图的数据
          // 当使用多个LogicFlow时，会创建多个flowId + 同时使用KeepAlive
          // 每一次items改变，会触发不同flowId持有的setup()执行，由于每次setup()执行就是遍历items，因此存在多次重复渲染元素的问题
          // 即items[0]会在Page1的setup()执行，items[0]也会在Page2的setup()执行，从而生成两个items[0]

          // 比对当前界面显示的flowId，只更新items[当前页面flowId:nodeId]的数据
          // 比如items[0]属于Page1的数据，那么Page2无论active=true/false，都无法执行items[0]
          if (id.startsWith(props.flowId)) {
            children.push(items[id])
          }
        })
        return h(
          Fragment,
          {},
          children.map((item) => h(item)),
        )
      }
    },
  })
}

/**
 * 创建并挂载 Teleport 容器组件
 * @param container 目标容器元素
 * @param flowId 当前流程图的唯一标识
 */
export function createTeleportContainer(
  container: HTMLElement,
  flowId: string | undefined,
): void {
  if (!isVue3 || !flowId || !container || !active) return

  // 获取 Teleport 组件
  const TeleportContainer = getTeleport()

  // 不重新创建 Teleport 容器组件
  if (appInstances.has(flowId)) {
    return
  }

  // ✅ 1. 创建独立容器放到目标容器中
  const mountPoint = document.createElement('div')
  container.appendChild(mountPoint)

  // ✅ 2. 创建并挂载 Vue 应用到新容器
  const app = createApp(TeleportContainer, { flowId })
  app.mount(mountPoint)

  appInstances.set(flowId, app)
}
