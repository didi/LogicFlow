import Ids from 'ids';

export function groupRule() {
  const rule = {
    message: '分组外的节点不允许连接分组内的',
    validate: (
      _sourceNode: any,
      _targetNode: any,
      _sourceAnchor: any,
      _targetAnchor: any,
    ) => {
      const isSourceNodeInsideTheGroup = !!_sourceNode.properties.parent;
      const isTargetNodeInsideTheGroup = !!_targetNode.properties.parent;

      return !(!isSourceNodeInsideTheGroup && isTargetNodeInsideTheGroup);
    },
  };
  this.targetRules.push(rule);
}

// @ts-ignore
const ids = new Ids([32, 32, 1]);

export function genBpmnId(): string {
  return ids.next();
}
