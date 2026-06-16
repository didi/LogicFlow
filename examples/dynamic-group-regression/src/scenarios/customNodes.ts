import LogicFlow from '@logicflow/core'
import { dynamicGroup, DynamicGroupNodeModel } from '@logicflow/extension'

/** #2412：isRestrict + isAllowAppendIn 恒 false */
export class LockedGroupModel extends DynamicGroupNodeModel {
  initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data)
    this.isRestrict = true
    this.properties = {
      ...this.properties,
      isRestrict: true,
    }
  }

  isAllowAppendIn() {
    return false
  }
}

export function registerLockedGroup(lf: LogicFlow) {
  if (lf.graphModel.modelMap.get('locked-dynamic-group')) return
  lf.register({
    type: 'locked-dynamic-group',
    view: dynamicGroup.view,
    model: LockedGroupModel,
  })
}

export const baseGroupProps = {
  width: 320,
  height: 200,
  collapsedWidth: 80,
  collapsedHeight: 60,
  collapsible: true,
  isCollapsed: false,
  isRestrict: false,
}

export function makeGroup(
  id: string,
  x: number,
  y: number,
  children: string[],
  extra: Record<string, unknown> = {},
  type = 'dynamic-group',
) {
  return {
    id,
    type,
    x,
    y,
    text: id,
    resizable: true,
    rotatable: false,
    properties: {
      ...baseGroupProps,
      children,
      ...extra,
    },
  }
}
