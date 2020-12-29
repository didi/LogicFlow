import { h, Component, ComponentChildren } from 'preact';
import { observer, inject } from 'mobx-react';

import GraphModel from '../../model/GraphModel';
import BaseNodeModel from '../../model/node/BaseNodeModel';
import Rect from '../basic-shape/Rect';
import Outline from '../Outline';
import { ElementState, EventType } from '../../constant/constant';
import EventEmitter from '../../event/eventEmitter';

type IProps = {
  children: ComponentChildren;
  model: BaseNodeModel;
  eventCenter: EventEmitter;
};
type IState = {
  hover: boolean
};
type InjectedProps = IProps & {
  graphModel: GraphModel
};

const GAP = 12;
@inject('graphModel')
@observer
class NodeHitable extends Component<IProps, IState> {
  startTime: number;
  preStartTime: number;
  get InjectedProps() {
    return this.props as InjectedProps;
  }
  handleClick = (e: MouseEvent) => {
    const time = new Date().getTime() - this.startTime;
    if (time > 200) return; // 事件大于200ms，认为是拖拽。
    const { model, eventCenter } = this.props;
    const { graphModel } = this.InjectedProps;
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData();
    // 两次点击间隔小于200ms， 认为是双击
    if (this.preStartTime && this.startTime - this.preStartTime < 200) {
      model.setSelected(false);
      graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
      eventCenter.emit(EventType.NODE_DBCLICK, {
        data: nodeData,
        e,
      });
    } else {
      eventCenter.emit(EventType.ELEMENT_CLICK, {
        data: nodeData,
        e,
      });
      eventCenter.emit(EventType.NODE_CLICK, {
        data: nodeData,
        e,
      });
    }
    graphModel.toFront(model.id);
    this.preStartTime = this.startTime;
  };
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
    const { model, eventCenter } = this.props;
    const { graphModel } = this.InjectedProps;
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData();
    // fixme: 这里的x, y不准确，当graph较大，页面有滚动条的时候，位置是不正确的。
    const offsetPosition = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    });
    graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, offsetPosition);
    graphModel.toFront(model.id);
    eventCenter.emit(EventType.NODE_CONTEXTMENU, {
      data: nodeData,
      e: ev,
    });
  };
  handleMouseDown = () => {
    const { model } = this.props;
    const { graphModel } = this.InjectedProps;
    graphModel.toFront(model.id);
    this.startTime = new Date().getTime();
  };
  setHoverON = () => {
    const { model } = this.props;
    model.setHovered(true);
  };
  setHoverOFF = () => {
    const { model } = this.props;
    model.setHovered(false);
  };

  render() {
    const { children, model } = this.props;
    const {
      x, y, width, height, isSelected, outlineColor, isHovered, isHitable,
    } = model;
    const props = {
      x,
      y,
      width: width + GAP,
      height: height + GAP,
      className: 'lf-node-hit',
      stroke: 'none',
    };
    if (isHitable) {
      return (
        <g
          className="lf-node-hit-able"
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleClick}
          onMouseEnter={this.setHoverON}
          onMouseLeave={this.setHoverOFF}
          onContextMenu={this.handleContextMenu}
        >
          <Rect
            {...props}
          />
          <Outline
            {...props}
            outlineColor={outlineColor}
            visiable={isSelected || isHovered}
          />
          {children}
        </g>
      );
    }
    return (
      <g className="lf-node-not-hit-able">
        { children }
      </g>
    );
  }
}

export default NodeHitable;
