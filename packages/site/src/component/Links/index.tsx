import { Component, h } from 'preact';
import './index.less';

type IProps = {
};

type IState = {
};

export default class Links extends Component<IProps, IState> {
  render() {
    return (
      <div className="links">
        More:
        <a
          href="/examples/#/extension/bpmn"
          target="_blank"
        >
          BPMN 规范流程图
        </a>
        <a
          href="/"
          target="_blank"
        >
          LogicFlow 文档
        </a>
      </div>
    );
  }
}
