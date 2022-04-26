import { h, Component } from 'preact';
import { map } from 'lodash-es';
import GraphModel from '../../model/GraphModel';
import Anchor from '../Anchor';
import BaseNodeModel from '../../model/node/BaseNodeModel';
import BaseText from '../text/BaseText';
import { ElementState, EventType, OverlapMode } from '../../constant/constant';
import { StepDrag } from '../../util/drag';
import { snapToGrid } from '../../util/geometry';
import { isIe } from '../../util/browser';
import { isMultipleSelect } from '../../util/graph';
import { CommonTheme } from '../../constant/DefaultTheme';
import { cancelRaf, createRaf } from '../../util/raf';

type IProps = {
  model: BaseNodeModel;
  graphModel: GraphModel;
};

type IState = {
  isHovered: boolean;
  isDragging?: boolean;
};

type StyleAttribute = CommonTheme;

export default abstract class BaseNode extends Component<IProps, IState> {
  t: any;
  moveOffset: { x: number; y: number; };
  static getModel(defaultModel) {
    return defaultModel;
  }
  stepDrag: StepDrag;
  contextMenuTime: number;
  startTime: number;
  clickTimer: number;
  constructor(props) {
    super();
    const {
      graphModel: { gridSize, eventCenter }, model,
    } = props;
    // 不在构造函数中判断，因为editConfig可能会被动态改变
    this.stepDrag = new StepDrag({
      onDragStart: this.onDragStart,
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      step: gridSize,
      eventType: 'NODE',
      isStopPropagation: false,
      eventCenter,
      model,
    });
    this.state = {
      isHovered: false,
    };
  }
  abstract getShape();
  getAnchorShape(anchorData): h.JSX.Element {
    return null;
  }
  getAnchors() {
    const { model, graphModel } = this.props;
    const {
      isSelected, isHitable, isDragging,
    } = model;
    const { isHovered } = this.state;
    if (isHitable && (isSelected || isHovered) && !isDragging) {
      const edgeStyle = model.getAnchorLineStyle();
      return map(model.anchors,
        (anchor, index) => {
          const style = model.getAnchorStyle(anchor);
          return (
            <Anchor
              anchorData={anchor}
              node={this}
              style={style}
              edgeStyle={edgeStyle}
              anchorIndex={index}
              nodeModel={model}
              graphModel={graphModel}
              setHoverOFF={this.setHoverOFF}
            />
          );
        });
    }
    return [];
  }
  getText() {
    const { model, graphModel } = this.props;
    // 文本被编辑的时候，显示编辑框，不显示文本。
    if (model.state === ElementState.TEXT_EDIT) {
      return '';
    }
    if (model.text) {
      const { editConfigModel } = graphModel;
      let draggable = false;
      if (model.text.draggable || editConfigModel.nodeTextDraggable) {
        draggable = true;
      }
      return (
        <BaseText
          editable={editConfigModel.nodeTextEdit && model.text.editable}
          model={model}
          graphModel={graphModel}
          draggable={draggable}
        />
      );
    }
  }
  getStateClassName() {
    const { model: { state, isDragging } } = this.props;
    let className = 'lf-node';
    switch (state) {
      case ElementState.ALLOW_CONNECT:
        className += ' lf-node-allow';
        break;
      case ElementState.NOT_ALLOW_CONNECT:
        className += ' lf-node-not-allow';
        break;
      default:
        className += ' lf-node-default';
        break;
    }
    if (isDragging) {
      className += ' lf-isDragging';
    }
    return className;
  }
  onDragStart = ({ event: { clientX, clientY } }) => {
    const { model, graphModel } = this.props;
    const {
      canvasOverlayPosition: { x, y },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    });
    this.moveOffset = {
      x: model.x - x,
      y: model.y - y,
    };
  };
  onDragging = ({ event }) => {
    const { model, graphModel } = this.props;
    // const { isDragging } = model;
    const {
      editConfigModel,
      transformModel,
      width,
      height,
      gridSize,
    } = graphModel;
    model.setIsDragging(true);
    const { clientX, clientY } = event;
    let {
      canvasOverlayPosition: { x, y },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    });
    const [x1, y1] = transformModel.CanvasPointToHtmlPoint([x, y]);
    if (x1 < 0
      || y1 < 0
      || x1 > width
      || y1 > height) { // 鼠标超出画布后的拖动，不处理，而是让上一次setInterval持续滚动画布
      return;
    }
    // 1. 考虑画布被缩放
    // 2. 考虑鼠标位置不再节点中心
    x = x + this.moveOffset.x;
    y = y + this.moveOffset.y;
    // 将x, y移动到grid上
    x = snapToGrid(x, gridSize);
    y = snapToGrid(y, gridSize);
    // 取节点左上角和右下角，计算节点移动是否超出范围
    const [leftTopX, leftTopY] = transformModel.CanvasPointToHtmlPoint(
      [x - model.width / 2, y - model.height / 2],
    );
    const [rightBottomX, rightBottomY] = transformModel.CanvasPointToHtmlPoint(
      [x + model.width / 2, y + model.height / 2],
    );
    const size = Math.max(gridSize, 20);
    let nearBoundary = [];
    if (leftTopX < 0) {
      nearBoundary = [size, 0];
    } else if (rightBottomX > graphModel.width) {
      nearBoundary = [-size, 0];
    } else if (leftTopY < 0) {
      nearBoundary = [0, size];
    } else if (rightBottomY > graphModel.height) {
      nearBoundary = [0, -size];
    }
    if (this.t) {
      cancelRaf(this.t);
    }
    if (nearBoundary.length > 0 && !editConfigModel.stopMoveGraph) {
      this.t = createRaf(() => {
        const [translateX, translateY] = nearBoundary;
        transformModel.translate(translateX, translateY);
        graphModel.moveNode(
          model.id, -translateX / transformModel.SCALE_X, -translateY / transformModel.SCALE_X,
        );
      });
    } else {
      graphModel.moveNode2Coordinate(
        model.id,
        x,
        y,
      );
    }
  };
  onDragEnd = () => {
    if (this.t) {
      cancelRaf(this.t);
    }
    const { model } = this.props;
    model.setIsDragging(false);
  };
  handleClick = (e: MouseEvent) => {
    // 节点拖拽进画布之后，不触发click事件相关emit
    // 点拖拽进画布没有触发mousedown事件，没有startTime，用这个值做区分
    if (!this.startTime) return;
    const time = new Date().getTime() - this.startTime;
    if (time > 200) return; // 事件大于200ms，认为是拖拽。
    const { model, graphModel } = this.props;
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData();
    const position = graphModel.getPointByClient({
      x: e.clientX,
      y: e.clientY,
    });

    const eventOptions = {
      data: nodeData,
      e,
      position,
    };

    const isRightClick = e.button === 2;
    // 这里 IE 11不能正确显示
    const isDoubleClick = e.detail === 2;

    // 判断是否有右击，如果有右击则取消点击事件触发
    if (isRightClick) return;

    const { editConfigModel } = graphModel;
    graphModel.selectNodeById(model.id, isMultipleSelect(e, editConfigModel));
    this.toFront();

    // 不是双击的，默认都是单击
    if (isDoubleClick) {
      if (editConfigModel.nodeTextEdit && model.text.editable) {
        model.setSelected(false);
        graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
      }
      graphModel.eventCenter.emit(EventType.NODE_DBCLICK, eventOptions);
    } else {
      graphModel.eventCenter.emit(EventType.ELEMENT_CLICK, eventOptions);
      graphModel.eventCenter.emit(EventType.NODE_CLICK, eventOptions);
    }
  };
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
    const { model, graphModel } = this.props;
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData();

    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    });
    graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPosition);
    graphModel.selectNodeById(model.id);
    graphModel.eventCenter.emit(EventType.NODE_CONTEXTMENU, {
      data: nodeData,
      e: ev,
      position,
    });
    this.toFront();
  };
  handleMouseDown = (ev: MouseEvent) => {
    const { model, graphModel } = this.props;
    this.toFront();
    this.startTime = new Date().getTime();
    const { editConfigModel } = graphModel;
    if (editConfigModel.adjustNodePosition && model.draggable) {
      this.stepDrag && this.stepDrag.handleMouseDown(ev);
    }
  };
  // 不清楚以前为啥要把hover状态放到model中，先改回来。
  setHoverON = (ev) => {
    const { isHovered } = this.state;
    if (isHovered) return;
    this.setState({
      isHovered: true,
    });
    const { model, graphModel } = this.props;
    const nodeData = model.getData();
    model.setHovered(true);
    graphModel.eventCenter.emit(EventType.NODE_MOUSEENTER, {
      data: nodeData,
      e: ev,
    });
  };
  setHoverOFF = (ev) => {
    this.setState({
      isHovered: false,
    });
    const { model, graphModel } = this.props;
    const nodeData = model.getData();
    model.setHovered(false);
    graphModel.eventCenter.emit(EventType.NODE_MOUSELEAVE, {
      data: nodeData,
      e: ev,
    });
  };
  onMouseOut = (ev) => {
    if (isIe) {
      this.setHoverOFF(ev);
    }
  };
  /**
   * 节点置顶，可以被某些不需要置顶的节点重写，如group节点。
   */
  toFront() {
    const { model, graphModel } = this.props;
    const { overlapMode } = graphModel;
    if (overlapMode !== OverlapMode.INCREASE && model.autoToFront) {
      graphModel.toFront(model.id);
    }
  }
  render() {
    const { model, graphModel } = this.props;
    const {
      editConfigModel: { hideAnchors, adjustNodePosition },
      gridSize,
      transformModel: { SCALE_X },
    } = graphModel;
    const {
      isHitable,
      draggable,
    } = model;
    const nodeShapeInner = (
      <g className="lf-node-content">
        {this.getShape()}
        {this.getText()}
        {
          hideAnchors ? null : this.getAnchors()
        }
      </g>
    );
    let nodeShape;
    if (!isHitable) {
      nodeShape = (
        <g className={this.getStateClassName()}>
          { nodeShapeInner }
        </g>
      );
    } else {
      if (adjustNodePosition && draggable) {
        this.stepDrag.setStep(gridSize * SCALE_X);
      }
      nodeShape = (
        <g
          className={this.getStateClassName()}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleClick}
          onMouseEnter={this.setHoverON}
          onMouseOver={this.setHoverON}
          onMouseLeave={this.setHoverOFF}
          onMouseOut={this.onMouseOut}
          onContextMenu={this.handleContextMenu}
        >
          { nodeShapeInner }
        </g>
      );
    }
    return nodeShape;
  }
}
