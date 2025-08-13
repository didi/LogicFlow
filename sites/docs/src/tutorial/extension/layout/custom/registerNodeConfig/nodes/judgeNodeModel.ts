import { BaseNodeModel } from './baseNodeModel';

// 触发事件节点
export class JudgeNodeModel extends BaseNodeModel {
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules();
    // 分支条件节点只能连出
    const leftAnchorNotAsSource = {
      message: '节点只能在分支条件连出',
      validate: (sourceNode: any, targetNode: any, sourceAnchor: any) =>
        sourceAnchor.id.includes('right'),
    };
    rules.push(leftAnchorNotAsSource);
    // 分支条件节点只能连出一个连线
    const onlyUniqueSource = {
      message: `节点每个分支只能与一个节点相连`,
      validate: (sourceNode: any, targetNode: any, sourceAnchor: any) => {
        const { edges } = this.outgoing;
        const isHaveBranchEdge =
          edges &&
          edges.length > 0 &&
          edges.some((edge) => {
            const { sourceAnchorId } = edge;
            return sourceAnchorId === sourceAnchor.id;
          });
        return !isHaveBranchEdge;
      },
    };
    rules.push(onlyUniqueSource);
    return rules;
  }
  // 连线规则-作为终点-不允许开始节点连入
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const rightAnchorNotAsTarget = {
      message: '节点分支条件不能连入',
      validate: (
        sourceNode: any,
        targetNode: any,
        sourceAnchor: any,
        targetAnchor: any,
      ) => !targetAnchor.id.includes('right'),
    };
    rules.push(rightAnchorNotAsTarget);
    return rules;
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    const { id, x, y, height, width, properties } = this;
    // 左侧锚点
    const leftAnchor = {
      x: x - width / 2,
      y,
      id: `${id}_1_left`,
    };
    // 右侧锚点
    const rightAnchors: any = [];
    const { branches = [] } = properties as {
      branches?: { anchorId: string }[];
    };
    if (branches.length > 0) {
      branches.forEach((item, index) => {
        rightAnchors.push({
          x: x + width / 2,
          y: y - height / 2 + 20 + 10 + 8 + 1 + 11 + 30 * index,
          id: item.anchorId,
        });
      });
    }
    return [leftAnchor, ...rightAnchors];
  }
}
