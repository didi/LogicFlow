import { h, Component } from 'preact';
import { map } from 'lodash-es';
import GraphModel from '../../model/GraphModel';
import Anchor from '../Anchor';
import BaseNodeModel from '../../model/node/BaseNodeModel';
import BaseText from '../text/BaseText';
import EventEmitter from '../../event/eventEmitter';
import { ElementState, EventType, OverlapMode } from '../../constant/constant';
import { StepDrag } from '../../util/drag';
import { isIe } from '../../util/browser';
import { isMultipleSelect } from '../../util/graph';
import { CommonTheme, OutlineTheme } from '../../constant/DefaultTheme';
import { NodeAttributes } from '../../type';

type IProps = {
  model: BaseNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

type Istate = {
  isDraging: boolean,
  isHovered: boolean,
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
      graphModel: { gridSize }, eventCenter, model,
    } = props;
    // 不在构造函数中判断，因为editConfig可能会被动态改变
    this.stepDrag = new StepDrag({
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
      step: gridSize,
      eventType: 'NODE',
      eventCenter,
      model,
    });
    this.state = {
      isDraging: false,
      isHovered: false,
    };
  }
  abstract getShape();
  /**
   * @overridable 支持重写
   * 获取自定义view组件样式信息
   * @example 我们定义一个节点，不论主题是怎么配置，这个节点都是被红色填充。
   * class CustomNode extends BaseNode {
   *   getShapeStyle () {
   *     const style = super.getShapeStyle();
   *     style.fill = 'red';
   *     return style;
   *   }
   * }
   *
   * 注意：不能直接自定义节点的宽高，因为宽高控制着节点的锚点、外边框以及连线的计算。
   * 如果想要自定义节点的宽高，请在自定义model中设置
   * @returns 自定义样式
   */
  getShapeStyle(): StyleAttribute {
    const {
      graphModel,
    } = this.props;
    return {
      ...graphModel.theme.baseNode,
    };
  }
  /**
   * @overridable 支持重写
   * 获取节点的基本信息，例如节点的属性，位置，状态等信息
   * @returns 节点基本信息
   */
  getAttributes(): NodeAttributes {
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
        width,
        height,
      },
    } = this.props;
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
      width,
      height,
      text: {
        ...text,
      },
    };
  }
  /**
   * 获取节点锚点样式
   * @returns 自定义样式
   */
  getAnchorStyle(): Record<string, any> {
    const { graphModel } = this.props;
    const { anchor } = graphModel.theme;
    // 防止被重写覆盖主题。
    return { ...anchor };
  }
  getProperties(): Record<string, any> {
    const { model } = this.props;
    return model.getProperties();
  }
  /* 支持节点自定义锚点hover样式 */
  getAnchorHoverStyle(): Record<string, any> {
    const { graphModel } = this.props;
    const { anchor } = graphModel.theme;
    const { hover } = anchor;
    return { ...anchor, ...hover };
  }
  /* 锚点创建连线样式 */
  getNewEdgeStyle(): Record<string, any> {
    const { graphModel } = this.props;
    const { anchorLine } = graphModel.theme;
    return { ...anchorLine };
  }
  getAnchors() {
    const { model, graphModel, eventCenter } = this.props;
    const {
      isSelected, isHitable,
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
            anchorData={anchor}
            nodeDraging={isDraging}
            style={style}
            hoverStyle={hoverStyle}
            edgeStyle={edgeStyle}
            anchorIndex={index}
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
    // 透传 nodeText
    const { nodeText } = graphModel.theme;
    return { ...nodeText };
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
    graphModel.moveNode(model.id, curDeltaX, curDeltaY);
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

    const { editConfig } = graphModel;
    graphModel.selectNodeById(model.id, isMultipleSelect(e, editConfig));
    this.toFront();

    // 不是双击的，默认都是单击
    if (isDoubleClick) {
      if (editConfig.nodeTextEdit && model.text.editable) {
        model.setSelected(false);
        graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
      }
      eventCenter.emit(EventType.NODE_DBCLICK, eventOptions);
    } else {
      eventCenter.emit(EventType.ELEMENT_CLICK, eventOptions);
      eventCenter.emit(EventType.NODE_CLICK, eventOptions);
    }
  };
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
    const { model, eventCenter, graphModel } = this.props;
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData();

    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    });
    graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPosition);
    graphModel.selectNodeById(model.id);
    eventCenter.emit(EventType.NODE_CONTEXTMENU, {
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
    const { editConfig } = graphModel;
    if (editConfig.adjustNodePosition && model.draggable) {
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
    if (overlapMode !== OverlapMode.INCREASE) {
      graphModel.toFront(model.id);
    }
  }
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
