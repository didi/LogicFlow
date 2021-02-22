import { h, Component } from 'preact';
import { map } from 'lodash-es';
import GraphModel from '../../model/GraphModel';
import Anchor from '../Anchor';
import BaseNodeModel from '../../model/node/BaseNodeModel';
import BaseText from '../text/BaseText';
import EventEmitter from '../../event/eventEmitter';
import { ElementState, EventType } from '../../constant/constant';
import { StepDrag } from '../../util/drag';

type IProps = {
  model: BaseNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

type Istate = {
  isDraging: boolean,
  isHovered: boolean,
};

export default abstract class BaseNode extends Component<IProps, Istate> {
  static getModel(defaultModel) {
    return defaultModel;
  }
  stepDrag: StepDrag;
  startTime: number;
  preStartTime: number;
  contextMenuTime: number;
  clickTimer: number;
  constructor(props) {
    super();
    const {
      graphModel: { gridSize, editConfig }, eventCenter, model,
    } = props;
    if (editConfig.adjustNodePosition && model.draggable) {
      this.stepDrag = new StepDrag({
        onDragStart: this.onDragStart,
        onDraging: this.onDraging,
        onDragEnd: this.onDragEnd,
        step: gridSize,
        eventType: 'NODE',
        eventCenter,
        model,
      });
    }
    this.state = {
      isDraging: false,
      isHovered: false,
    };
  }
  abstract getShape();
  getShapeStyle() {
    const {
      model: {
        width,
        height,
        fill,
        fillOpacity,
        strokeWidth,
        stroke,
        strokeOpacity,
        opacity,
        outlineColor,
      },
    } = this.props;
    return {
      width,
      height,
      fill,
      fillOpacity,
      strokeWidth,
      stroke,
      strokeOpacity,
      opacity,
      outlineColor,
    };
  }
  getAttributes() {
    const {
      model: {
        id,
        properties = {},
        type,
        x,
        y,
        isSelected,
        isHovered,
        text,
      },
    } = this.props;
    const style = this.getShapeStyle();
    return {
      id,
      properties: {
        ...properties,
      },
      type,
      x,
      y,
      isSelected,
      isHovered,
      text: {
        ...text,
      },
      ...style,
    };
  }
  getProperties() {
    const { model } = this.props;
    return model.getProperties();
  }
  /* 支持节点自定义锚点样式 */
  getAnchorStyle() {
    const { graphModel } = this.props;
    const { anchor } = graphModel.theme;
    return anchor;
  }
  /* 支持节点自定义锚点hover样式 */
  getAnchorHoverStyle() {
    const { graphModel } = this.props;
    const { anchorHover } = graphModel.theme;
    return anchorHover;
  }
  /* 锚点创建连线样式 */
  getNewEdgeStyle() {
    const { graphModel } = this.props;
    const { anchorLine } = graphModel.theme;
    return anchorLine;
  }
  getAnchors() {
    const { model, graphModel, eventCenter } = this.props;
    const {
      isSelected, activeAnchor, isHitable,
    } = model;
    const { isHovered, isDraging } = this.state;
    if (isHitable && (isSelected || isHovered)) {
      const style = this.getAnchorStyle();
      const hoverStyle = this.getAnchorHoverStyle();
      const edgeStyle = this.getNewEdgeStyle();
      return map(model.anchors,
        (anchor, index) => (
          <Anchor
            {...anchor}
            nodeDraging={isDraging}
            style={style}
            hoverStyle={hoverStyle}
            edgeStyle={edgeStyle}
            anchorIndex={index}
            activeAnchor={activeAnchor}
            nodeModel={model}
            eventCenter={eventCenter}
            graphModel={graphModel}
            setHoverOFF={this.setHoverOFF}
          />
        ));
    }
    return [];
  }
  /* 支持节点自定义文案样式 */
  getTextStyle() {
    const { graphModel } = this.props;
    const { nodeText } = graphModel.theme;
    return nodeText;
  }
  getText() {
    const { model, graphModel } = this.props;
    // 文本被编辑的时候，显示编辑框，不显示文本。
    if (model.state === ElementState.TEXT_EDIT) {
      return '';
    }
    const style = this.getTextStyle();
    if (model.text) {
      const { editConfig } = graphModel;
      let draggable = false;
      if (model.text.draggable || editConfig.nodeTextDraggable) {
        draggable = true;
      }
      return (
        <BaseText
          editable={editConfig.nodeTextEdit && model.text.editable}
          style={style}
          model={model}
          graphModel={graphModel}
          draggable={draggable}
        />
      );
    }
  }
  getStateClassName() {
    const { model: { state } } = this.props;
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
    const { isDraging } = this.state;
    if (isDraging) {
      className += ' lf-dragging';
    }
    return className;
  }
  // 拖拽相关API-为了减少高阶组件导致调用栈爆掉，将其迁移进来
  onDragStart = () => {};

  onDraging = ({ deltaX, deltaY }) => {
    const { model, graphModel } = this.props;
    const { isDraging } = this.state;
    if (!isDraging) {
      this.setState({
        isDraging: true,
      });
    }
    const { transformMatrix } = graphModel;

    const [curDeltaX, curDeltaY] = transformMatrix.fixDeltaXY(deltaX, deltaY);
    if (model.modelType.indexOf('node') > -1) {
      graphModel.moveNode(model.id, curDeltaX, curDeltaY);
    }
  };
  onDragEnd = () => {
    this.setState({
      isDraging: false,
    });
  };
  handleClick = (e: MouseEvent) => {
    // 节点拖拽进画布之后，不触发click事件相关emit
    // 点拖拽进画布没有触发mousedown事件，没有startTime，用这个值做区分
    if (!this.startTime) return;
    const time = new Date().getTime() - this.startTime;
    if (time > 200) return; // 事件大于200ms，认为是拖拽。
    const { model, eventCenter, graphModel } = this.props;
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData();
    const position = graphModel.getPointByClient({
      x: e.clientX,
      y: e.clientY,
    });
    // 两次点击间隔小于200ms， 认为是双击
    // 节点点击事件推迟200ms触发，如果有双击则取消第一次点击事件触发
    if (this.preStartTime && this.startTime - this.preStartTime < 200) {
      if (this.clickTimer) { window.clearTimeout(this.clickTimer); }
      const { editConfig } = graphModel;
      if (editConfig.nodeTextEdit && model.text.editable) {
        model.setSelected(false);
        graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
        eventCenter.emit(EventType.NODE_DBCLICK, {
          data: nodeData,
          e,
          position,
        });
      }
    } else {
      this.clickTimer = window.setTimeout(() => {
        // 节点右击也会触发mouseup事件，判断是否有右击，如果有右击则取消点击事件触发
        if (!this.contextMenuTime || this.startTime > this.contextMenuTime) {
          eventCenter.emit(EventType.ELEMENT_CLICK, {
            data: nodeData,
            e,
            position,
          });
          eventCenter.emit(EventType.NODE_CLICK, {
            data: nodeData,
            e,
            position,
          });
        }
      }, 400);
    }
    graphModel.toFront(model.id);
    const { editConfig: { metaKeyMultipleSelected } } = graphModel;
    graphModel.selectNodeById(model.id, e.metaKey && metaKeyMultipleSelected);
    this.preStartTime = this.startTime;
  };
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
    // 节点右击也会触发时间，区分右击和点击(mouseup)
    this.contextMenuTime = new Date().getTime();
    if (this.clickTimer) { clearTimeout(this.clickTimer); }
    const { model, eventCenter, graphModel } = this.props;
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData();

    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    });
    graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPosition);
    graphModel.toFront(model.id);
    graphModel.selectNodeById(model.id);
    eventCenter.emit(EventType.NODE_CONTEXTMENU, {
      data: nodeData,
      e: ev,
      position,
    });
  };
  handleMouseDown = (ev: MouseEvent) => {
    const { model, graphModel } = this.props;
    graphModel.toFront(model.id);
    this.startTime = new Date().getTime();
    this.stepDrag && this.stepDrag.handleMouseDown(ev);
  };
  // 不清楚以前为啥要把hover状态放到model中，先改回来。
  setHoverON = (ev) => {
    this.setState({
      isHovered: true,
    });
    const { model, eventCenter } = this.props;
    const nodeData = model.getData();
    model.setHovered(true);
    eventCenter.emit(EventType.NODE_MOUSEENTER, {
      data: nodeData,
      e: ev,
    });
  };
  setHoverOFF = (ev) => {
    this.setState({
      isHovered: false,
    });
    const { model, eventCenter } = this.props;
    const nodeData = model.getData();
    model.setHovered(false);
    eventCenter.emit(EventType.NODE_MOUSELEAVE, {
      data: nodeData,
      e: ev,
    });
  };
  render() {
    const { model, graphModel } = this.props;
    const {
      editConfig: { hideAnchors, adjustNodePosition },
      gridSize,
      transformMatrix: { SCALE_X },
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
        <g className={this.getStateClassName()} id={model.id}>
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
          id={model.id}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleClick}
          onMouseEnter={this.setHoverON}
          onMouseLeave={this.setHoverOFF}
          onContextMenu={this.handleContextMenu}
        >
          { nodeShapeInner }
        </g>
      );
    }
    return nodeShape;
  }
}
