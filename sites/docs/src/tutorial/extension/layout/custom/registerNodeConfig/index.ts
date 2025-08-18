import { register } from '@logicflow/react-node-registry';
import BaseNodeView from './nodes/baseNodeView';
import BaseNodeComponent from './nodes/baseNodeComponent';
import { StartNodeModel } from './nodes/startNodeModel';
import { JudgeNodeModel } from './nodes/judgeNodeModel';
import { TaskNodeModel } from './nodes/taskNodeModel';
import { EndNodeModel } from './nodes/endNodeModel';

export default function registerNode(lfInstance: any) {
  register(
    {
      type: 'start',
      model: StartNodeModel,
      view: BaseNodeView,
      component: BaseNodeComponent,
    },
    lfInstance,
  );
  register(
    {
      type: 'judge',
      model: JudgeNodeModel,
      view: BaseNodeView,
      component: BaseNodeComponent,
    },
    lfInstance,
  );
  register(
    {
      type: 'task',
      model: TaskNodeModel,
      view: BaseNodeView,
      component: BaseNodeComponent,
    },
    lfInstance,
  );
  register(
    {
      type: 'end',
      model: EndNodeModel,
      view: BaseNodeView,
      component: BaseNodeComponent,
    },
    lfInstance,
  );
}
