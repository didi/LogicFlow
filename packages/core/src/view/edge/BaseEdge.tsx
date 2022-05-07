import { h, Component } from 'preact';
import { assign } from 'lodash-es';
import Arrow, { ArrowStyle } from './Arrow';
import BaseEdgeModel from '../../model/edge/BaseEdgeModel';
import GraphModel from '../../model/GraphModel';
import LineText from '../text/LineText';
import { ElementState, EventType, ModelType, OverlapMode } from '../../constant/constant';
import { ArrowInfo, IEdgeState } from '../../type/index';
import { PolylineEdgeModel } from '../..';
import { getClosestPointOfPolyline } from '../../util/edge';
import AdjustPoint from './AdjustPoint';
import { isMultipleSelect } from '../../util/graph';

type IProps = {
  model: BaseEdgeModel;
  graphModel: GraphModel;
};

export default class BaseEdge extends Component<IProps> {
  startTime: number;
  contextMenuTime: number;
  clickTimer: number;
  getShape() { }
  getTextStyle() {
  }
  getText() {
    const { model, graphModel } = this.props;
    // 文本被编辑的时候，显示编辑框，不显示文本。
    if (model.state === ElementState.TEXT_EDIT) {
      return '';
    }
    let draggable = false;
    const { editConfigModel } = graphModel;
    if (model.text.draggable || editConfigModel.edgeTextDraggable) {
      draggable = true;
    }
    return (
      <LineText
        editable={editConfigModel.edgeTextEdit && model.text.editable}
        model={model}
        graphModel={graphModel}
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
    const { model, graphModel } = this.props;
    const edgeStyle = model.getEdgeStyle();
    const edgeAnimationStyle = model.getEdgeAnimationStyle();
    const { arrow } = graphModel.theme;
    const stroke = model.isAnimation ? edgeAnimationStyle.stroke : edgeStyle.stroke;
    return {
      ...edgeStyle,
      fill: stroke,
      stroke,
      ...arrow,
    } as ArrowStyle;
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
  // 起点终点，可以修改起点/终点为其他节点
  getAdjustPoints() {
    const { model, graphModel } = this.props;
    const start = model.getAdjustStart();
    const end = model.getAdjustEnd();
    return (
      <g>
        <AdjustPoint
          type="SOURCE"
          {...start}
          edgeModel={model}
          graphModel={graphModel}
        />
        <AdjustPoint
          type="TARGET"
          {...end}
          edgeModel={model}
          graphModel={graphModel}
        />
      </g>
    );
  }
  getAnimation() { }
  getAppendWidth() {
    return <g />;
  }
  getAppend() {
    return (
      <g
        className="lf-edge-append"
      >
        {this.getAppendWidth()}
      </g>
    );
  }
  handleHover = (hovered, ev) => {
    const { model, graphModel: { eventCenter } } = this.props;
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
  // 右键点击节点，设置节点未现在菜单状态
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
    // 节点右击也会触发时间，区分右击和点击(mouseup)
    this.contextMenuTime = new Date().getTime();
    if (this.clickTimer) { clearTimeout(this.clickTimer); }
    const { model, graphModel } = this.props;
    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    });
    graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPosition);
    this.toFront();
    graphModel.selectEdgeById(model.id);
    // 边数据
    const edgeData = model?.getData();
    graphModel.eventCenter.emit(EventType.EDGE_CONTEXTMENU, {
      data: edgeData,
      e: ev,
      position,
    });
  };
  handleMouseDown = (e) => {
    e.stopPropagation();
    this.startTime = new Date().getTime();
  };
  // todo: 去掉setTimeout
  handleMouseUp = (e: MouseEvent) => {
    if (!this.startTime) return;
    const time = new Date().getTime() - this.startTime;
    if (time > 200) return; // 事件大于200ms，认为是拖拽。
    const isRightClick = e.button === 2;
    if (isRightClick) return;
    // 这里 IE 11不能正确显示
    const isDoubleClick = e.detail === 2;
    const { model, graphModel } = this.props;
    const edgeData = model?.getData();
    const position = graphModel.getPointByClient({
      x: e.clientX,
      y: e.clientY,
    });
    if (isDoubleClick) {
      const { editConfigModel, textEditElement } = graphModel;
      // 当前边正在编辑，需要先重置状态才能变更文本框位置
      if (textEditElement && textEditElement.id === model.id) {
        graphModel.setElementStateById(model.id, ElementState.DEFAULT);
      }
      // 边文案可编辑状态，才可以进行文案编辑
      if (editConfigModel.edgeTextEdit && model.text.editable) {
        graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
      }
      if (model.modelType === ModelType.POLYLINE_EDGE) {
        const polylineEdgeModel = model as PolylineEdgeModel;
        const { canvasOverlayPosition: { x, y } } = graphModel.getPointByClient({ x: e.x, y: e.y });
        const crossPoint = getClosestPointOfPolyline({ x, y }, polylineEdgeModel.points);
        polylineEdgeModel.dbClickPosition = crossPoint;
      }
      graphModel.eventCenter.emit(EventType.EDGE_DBCLICK, {
        data: edgeData,
        e,
        position,
      });
    } else { // 单击
      // 边右击也会触发mouseup事件，判断是否有右击，如果有右击则取消点击事件触发
      // 边数据
      graphModel.eventCenter.emit(EventType.ELEMENT_CLICK, {
        data: edgeData,
        e,
        position,
      });
      graphModel.eventCenter.emit(EventType.EDGE_CLICK, {
        data: edgeData,
        e,
        position,
      });
    }
    const { editConfigModel } = graphModel;
    graphModel.selectEdgeById(model.id, isMultipleSelect(e, editConfigModel));
    this.toFront();
  };
  // 是否正在拖拽，在折线调整时，不展示起终点的调整点
  getIsDraging = () => false;
  toFront() {
    const { graphModel, model } = this.props;
    const { overlapMode } = graphModel;
    if (overlapMode !== OverlapMode.INCREASE) {
      graphModel.toFront(model.id);
    }
  }
  render() {
    const { model: { isSelected, isHitable }, graphModel } = this.props;
    const isDraging = this.getIsDraging();
    const { editConfigModel: { adjustEdgeStartAndEnd }, animation } = graphModel;
    // performance 只允许出现一条edge有动画
    const isShowAnimation = isSelected && animation.edge
      && graphModel.getSelectElements().edges.length === 1;
    return (
      <g>
        <g
          className={isHitable ? 'lf-edge' : 'lf-edge pointer-none'}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onContextMenu={this.handleContextMenu}
          onMouseOver={this.setHoverON}
          onMouseEnter={this.setHoverON}
          onMouseLeave={this.setHoverOFF}
        >
          {this.getShape()}
          {this.getAppend()}
          {isShowAnimation && this.getAnimation()}
          {this.getText()}
          {this.getArrow()}
        </g>
        {(adjustEdgeStartAndEnd && isSelected && !isDraging) ? this.getAdjustPoints() : ''}
      </g>
    );
  }
}
