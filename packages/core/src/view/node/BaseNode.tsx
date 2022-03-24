import { h, Component } from 'preact';
import { map } from 'lodash-es';
import GraphModel from '../../model/GraphModel';
import Anchor from '../Anchor';
import BaseNodeModel from '../../model/node/BaseNodeModel';
import BaseText from '../text/BaseText';
import { ElementState, EventType, OverlapMode } from '../../constant/constant';
import { StepDrag } from '../../util/drag';
import { isIe } from '../../util/browser';
import { isMultipleSelect } from '../../util/graph';
import { CommonTheme } from '../../constant/DefaultTheme';

type IProps = {
  model: BaseNodeModel;
  graphModel: GraphModel;
};

type Istate = {
  isHovered: boolean;
  isDraging?: boolean;
};

type StyleAttribute = CommonTheme;

export default abstract class BaseNode extends Component<IProps, Istate> {
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
      onDraging: this.onDraging,
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
    if (isHitable && (isSelected || isHovered)) {
      const edgeStyle = model.getAnchorLineStyle();
      return map(model.anchors,
        (anchor, index) => {
          const style = model.getAnchorStyle(anchor);
          return (
            <Anchor
              anchorData={anchor}
              nodeDraging={isDragging}
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
    const { model: { state, isDraging } } = this.props;
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
    return className;
  }

  onDraging = ({ deltaX, deltaY }) => {
    const { model, graphModel } = this.props;
    const { isDraging } = this.state;
    if (!isDraging) {
      this.setState({
        isDraging: true,
      });
    }
    const { transformModel } = graphModel;
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY);
    graphModel.moveNode(model.id, curDeltaX, curDeltaY);
  };
  onDragEnd = () => {
    const { model } = this.props;
    model.isDragging = false;
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
