import { h, Component } from 'preact';
import { assign } from 'lodash-es';
import Arrow from './Arrow';
import BaseEdgeModel from '../../model/edge/BaseEdgeModel';
import GraphModel from '../../model/GraphModel';
import LineText from '../text/LineText';
import { ElementState, EventType } from '../../constant/constant';
import EventEmitter from '../../event/eventEmitter';
import { ArrowInfo, IEdgeState } from '../../type/index';

type IProps = {
  model: BaseEdgeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class BaseEdge extends Component<IProps> {
  getAttributes() {
    const {
      model: {
        strokeWidth,
        strokeOpacity,
        isSelected,
        isHovered,
        hoverStroke,
        selectedStroke,
        properties,
      },
    } = this.props;
    let {
      model: {
        stroke,
      },
    } = this.props;

    if (isHovered) {
      stroke = hoverStroke;
    } else if (isSelected) {
      stroke = selectedStroke;
    }
    return {
      stroke,
      strokeWidth,
      strokeOpacity,
      isSelected,
      isHovered,
      hoverStroke,
      selectedStroke,
      properties: {
        ...properties,
      },
    };
  }
  getShape() { }
  getTextStyle() {
  }
  getText() {
    const { model, graphModel } = this.props;
    // 文本被编辑的时候，显示编辑框，不显示文本。
    if (model.state === ElementState.TEXT_EDIT) {
      return '';
    }
    const { edgeText } = graphModel.theme;
    const custome = this.getTextStyle();
    const style = assign({}, edgeText, custome);
    let draggable = false;
    const { editConfig } = graphModel;
    if (model.text.draggable || editConfig.edgeTextDraggable) {
      draggable = true;
    }
    return (
      <LineText
        editable={editConfig.edgeTextEdit && model.text.editable}
        model={model}
        graphModel={graphModel}
        style={style}
        draggable={draggable}
      />
    );
  }
  getArrowInfo(): ArrowInfo {
    const { model } = this.props;
    const {
      startPoint, endPoint, isSelected,
    } = model;
    const { hover } = this.state as IEdgeState;
    return {
      start: startPoint,
      end: endPoint,
      hover,
      isSelected,
    };
  }
  getArrowStyle() {
    const { stroke } = this.getAttributes();
    const { graphModel } = this.props;
    const { offset, verticalLength } = graphModel.theme.arrow;
    return {
      stroke,
      strokeWidth: 1,
      fill: stroke,
      offset,
      verticalLength,
    };
  }
  getArrow() {
    const arrowInfo = this.getArrowInfo();
    const { start, end } = arrowInfo;
    // 起终点缺失，或者重合不渲染箭头
    if ((!start || !end) || (start.x === end.x && start.y === end.y)) {
      return;
    }
    const style = this.getArrowStyle();
    return (
      <Arrow arrowInfo={arrowInfo} style={style} />
    );
  }
  getAppendWidth() {
    return <g />;
  }
  getAppend() {
    return (
      <g
        className="lf-edge-append"
        onClick={this.handleClick}
        onDblClick={this.handleDbClick}
        onContextMenu={this.handleContextMenu}
        onMouseEnter={this.setHoverON}
        onMouseLeave={this.setHoverOFF}
      >
        {this.getAppendWidth()}
      </g>
    );
  }
  handleHover = (hovered, ev) => {
    const { model, eventCenter } = this.props;
    model.setHovered(hovered);
    const eventName = hovered ? EventType.EDGE_MOUSEENTER : EventType.EDGE_MOUSELEAVE;
    const nodeData = model.getData();
    eventCenter.emit(eventName, {
      data: nodeData,
      e: ev,
    });
  };
  setHoverON = (ev) => {
    this.handleHover(true, ev);
  };
  setHoverOFF = (ev) => {
    this.handleHover(false, ev);
  };
  handleDbClick = (e: MouseEvent) => {
    const { model, graphModel, eventCenter } = this.props;
    const { editConfig } = graphModel;
    // 边文案可编辑状态，才可以进行文案编辑
    if (editConfig.edgeTextEdit && model.text.editable) {
      graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
    }
    graphModel.toFront(model.id);
    graphModel.selectEdgeById(model.id);
    // 边数据
    const edgeData = model?.getData();
    eventCenter.emit(EventType.EDGE_DBCLICK, {
      data: edgeData,
      e,
    });
  };
  handleClick = (e) => {
    const { model, graphModel, eventCenter } = this.props;
    graphModel.toFront(model.id);
    graphModel.selectEdgeById(model.id);
    // 边数据
    const edgeData = model?.getData();
    const position = graphModel.getPointByClient({
      x: e.clientX,
      y: e.clientY,
    });
    eventCenter.emit(EventType.ELEMENT_CLICK, {
      data: edgeData,
      e,
      position,
    });
    eventCenter.emit(EventType.EDGE_CLICK, {
      data: edgeData,
      e,
      position,
    });
  };
  // 右键点击节点，设置节点未现在菜单状态
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
    const { model, graphModel, eventCenter } = this.props;
    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    });
    graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPostion);
    graphModel.toFront(model.id);
    graphModel.selectEdgeById(model.id);
    // 边数据
    const edgeData = model?.getData();
    eventCenter.emit(EventType.EDGE_CONTEXTMENU, {
      data: edgeData,
      e: ev,
      position,
    });
  };
  render() {
    return (
      <g
        className="lf-edge"
      >
        {this.getShape()}
        {this.getAppend()}
        {this.getText()}
        {this.getArrow()}
      </g>
    );
  }
}
