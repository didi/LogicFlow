import {
  h, Component, createRef,
} from 'preact';
import LogicFlow from '../LogicFlow';
// import BaseNodeModel from '../model/node/BaseNodeModel';
import GraphModel from '../model/GraphModel';
import BaseEdgeModel from '../model/edge/BaseEdgeModel';
import BaseNodeModel from '../model/node/BaseNodeModel';
import { ElementState, ElementType, EventType, ModelType } from '../constant/constant';
import { observer } from '..';
// import { ElementState } from '../constant/constant';

type Style = {
  left: number;
  top: number;
};

type IProps = {
  graphModel: GraphModel;
  logicFlow: LogicFlow;
};

type IState = {
  style: Style;
};

@observer
export default class TextEdit extends Component<IProps, IState> {
  ref = createRef();
  __prevText = {
    type: '',
    text: '',
    id: '',
  };

  constructor() {
    super();
    this.state = {
      style: {
        left: 0,
        top: 0,
      },
    };
  }

  componentDidMount() {
    if (this.ref.current) {
      this.ref.current.focus();
      this.placeCaretAtEnd(this.ref.current);
    }
    // @see https://github.com/didi/LogicFlow/issues/152
    const { graphModel } = this.props;
    const {
      eventCenter,
      editConfig: {
        edgeTextEdit,
        nodeTextEdit,
      },
    } = graphModel;
    if (edgeTextEdit || nodeTextEdit) {
      eventCenter.on(EventType.GRAPH_TRANSFORM, () => {
        if (graphModel.textEditElement) {
          graphModel.textEditElement.setElementState(ElementState.DEFAULT);
        }
      });
    }
  }
  static getDerivedStateFromProps(props) {
    const { graphModel } = props;
    const { transformMatrix, theme } = graphModel;
    let { textEditElement } = graphModel;
    let autoStyle;
    if (textEditElement) {
      // 由于连线上的文本是依据显示的时候动态计算出来的
      // 所以不能在连线创建的时候就初始化文本位置。
      // 而是在连线上新建文本的时候创建。
      if (!textEditElement.text?.value) {
        if (textEditElement.BaseType === ElementType.EDGE) {
          textEditElement = textEditElement as BaseEdgeModel;
          const textConfig = textEditElement.text;
          const { x, y } = textEditElement.textPosition;
          textConfig.x = x;
          textConfig.y = y;
          textEditElement.setText(textConfig);
        } else {
          textEditElement = textEditElement as BaseNodeModel;
        }
      }
      // 自动换行节点连线通用样式
      const commonAutoStyle = {
        resize: 'auto',
        whiteSpace: 'normal',
        wordBreak: 'break-all',
      };
      if (textEditElement.BaseType === ElementType.EDGE) {
        // 如果连线文案自动换行, 设置编辑框宽度
        const { edgeText: { autoWrap, lineHeight, wrapPadding } } = theme;
        const { textWidth } = textEditElement;
        if (autoWrap && textWidth) {
          autoStyle = {
            ...commonAutoStyle,
            width: textWidth,
            minWidth: textWidth,
            lineHeight,
            padding: wrapPadding,
          };
        }
      } else if (textEditElement.BaseType === ElementType.NODE) {
        // 如果节点文案自动换行, 设置编辑框宽度
        const { nodeText: { autoWrap, lineHeight, wrapPadding } } = theme;
        const { width, textWidth, modelType } = textEditElement;
        // 文本节点没有默认宽高，只有在设置了textWidth之后才能进行自动换行
        if ((modelType !== ModelType.TEXT_NODE && autoWrap)
        || (modelType === ModelType.TEXT_NODE && autoWrap && textWidth)) {
          autoStyle = {
            ...commonAutoStyle,
            width: textWidth || width,
            minWidth: textWidth || width,
            lineHeight,
            padding: wrapPadding,
          };
        }
      }
      const { x, y } = textEditElement.text;
      const [left, top] = transformMatrix.CanvasPointToHtmlPoint([x, y]);
      return {
        style: {
          left,
          top,
          ...autoStyle,
        },
      };
    }
  }

  componentDidUpdate() {
    const {
      graphModel,
    } = this.props;
    if (this.ref.current) {
      this.ref.current.focus();
      this.placeCaretAtEnd(this.ref.current);
    }
    if (this.__prevText.id !== '') {
      const { text, id } = this.__prevText;
      graphModel.setElementTextById(id, text);
      graphModel.eventCenter.emit(EventType.TEXT_UPDATE, { ...this.__prevText });
      this.__prevText.id = '';
      this.__prevText.text = '';
      this.__prevText.type = '';
    }
  }
  keyupHandler = (ev: KeyboardEvent) => {
    const { innerText: value } = ev.target as HTMLElement;
    const {
      graphModel: {
        textEditElement,
      },
    } = this.props;
    if (ev.keyCode === 13 && ev.altKey) {
      textEditElement.setElementState(0);
    }
    this.__prevText = {
      type: textEditElement.type,
      text: value,
      id: textEditElement.id,
    };
  };
  placeCaretAtEnd(el) {
    if (window.getSelection !== undefined && document.createRange !== undefined) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
  render() {
    const { graphModel: { textEditElement } } = this.props;
    const { style } = this.state;
    return (
      textEditElement
        ? (
          <div
            contentEditable
            className="lf-text-input"
            style={style}
            ref={this.ref}
            key={textEditElement.id}
            onKeyUp={this.keyupHandler}
          >
            {textEditElement.text?.value}
          </div>
        )
        : null
    );
  }
}
