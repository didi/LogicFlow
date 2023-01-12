import { h, Component } from 'preact';
import { debounce, map } from 'lodash-es';
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

type Istate = {
  isDraging?: boolean;
};

type StyleAttribute = CommonTheme;

export default abstract class BaseNode extends Component<IProps, Istate> {
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
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
      step: gridSize,
      eventType: 'NODE',
      isStopPropagation: false,
      eventCenter,
      model,
    });
  }
  abstract getShape();
  getAnchorShape(anchorData): h.JSX.Element {
    return null;
  }
  getAnchors() {
    const { model, graphModel } = this.props;
    const {
      isSelected, isHitable, isDragging, isShowAnchor,
    } = model;
    if (isHitable && (isSelected || isShowAnchor) && !isDragging) {
      return map(model.anchors,
        (anchor, index) => {
          const edgeStyle = model.getAnchorLineStyle(anchor);
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
    const { model: { state, isDraging, isSelected } } = this.props;
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
    if (isDraging) {
      className += ' lf-isDragging';
    }
    if (isSelected) {
      className += ' lf-node-selected';
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
  onDraging = ({ event }) => {
    const { model, graphModel } = this.props;
    // const { isDragging } = model;
    const {
      editConfigModel: {
        stopMoveGraph,
        autoExpand,
      },
      transformModel,
      width,
      height,
      gridSize,
    } = graphModel;
    model.isDragging = true;
    const { clientX, clientY } = event;
    let {
      canvasOverlayPosition: { x, y },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    });
    const [x1, y1] = transformModel.CanvasPointToHtmlPoint([x, y]);
    // 1. 考虑画布被缩放
    // 2. 考虑鼠标位置不再节点中心
    x = x + this.moveOffset.x;
    y = y + this.moveOffset.y;
    // 将x, y移动到grid上
    x = snapToGrid(x, gridSize);
    y = snapToGrid(y, gridSize);
    if (!width || !height) {
      graphModel.moveNode2Coordinate(
        model.id,
        x,
        y,
      );
      return;
    }
    const isOutCanvas = x1 < 0 || y1 < 0 || x1 > width || y1 > height;
    if (autoExpand && !stopMoveGraph && isOutCanvas) { // 鼠标超出画布后的拖动，不处理，而是让上一次setInterval持续滚动画布
      return;
    }
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
    if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
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
    model.isDragging = false;
  };
  handleClick = debounce((e: MouseEvent) => {
    // 节点拖拽进画布之后，不触发click事件相关emit
    // 点拖拽进画布没有触发mousedown事件，没有startTime，用这个值做区分
    if (!this.startTime) return;
    const time = new Date().getTime() - this.startTime;
    if (time > 200) return; // 事件大于200ms，认为是拖拽, 不触发click事件。
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
    // 在multipleSelect tool禁用的情况下，允许取消选中节点
    if (model.isSelected && !isDoubleClick && isMultipleSelect(e, editConfigModel)) {
      model.setSelected(false);
    } else {
      graphModel.selectNodeById(model.id, isMultipleSelect(e, editConfigModel));
      this.toFront();
    }

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
  }, 300);
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
    if (!model.isSelected) {
      graphModel.selectNodeById(model.id);
    }
    graphModel.eventCenter.emit(EventType.NODE_CONTEXTMENU, {
      data: nodeData,
      e: ev,
      position,
    });
    this.toFront();
  };
  handleMouseDown = (ev: MouseEvent) => {
    const { model, graphModel } = this.props;
    this.startTime = new Date().getTime();
    const { editConfigModel } = graphModel;
    if (editConfigModel.adjustNodePosition && model.draggable) {
      this.stepDrag && this.stepDrag.handleMouseDown(ev);
    }
  };
  // 为什么将hover状态放到model中？
  // 因为自定义节点的时候，可能会基于hover状态自定义不同的样式。
  setHoverON = (ev) => {
    const { model, graphModel } = this.props;
    if (model.isHovered) return;
    const nodeData = model.getData();
    model.setHovered(true);
    graphModel.eventCenter.emit(EventType.NODE_MOUSEENTER, {
      data: nodeData,
      e: ev,
    });
  };
  setHoverOFF = (ev) => {
    const { model, graphModel } = this.props;
    const nodeData = model.getData();
    if (!model.isHovered) return;
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
          onClick={this.handleClick}
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
