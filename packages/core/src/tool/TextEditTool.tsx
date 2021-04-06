import {
  h, Component, createRef,
} from 'preact';
import LogicFlow from '../LogicFlow';
// import BaseNodeModel from '../model/node/BaseNodeModel';
import GraphModel from '../model/GraphModel';
import BaseEdgeModel from '../model/edge/BaseEdgeModel';
import BaseNodeModel from '../model/node/BaseNodeModel';
import { ElementType } from '../constant/constant';
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
  }

  static getDerivedStateFromProps(props) {
    const { graphModel } = props;
    const { transformMatrix } = graphModel;
    let { textEditElement } = graphModel;
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
      const { x, y } = textEditElement.text;
      const [left, top] = transformMatrix.CanvasPointToHtmlPoint([x, y]);
      return {
        style: {
          left,
          top,
        },
      };
    }
  }

  componentDidUpdate() {
    const {
      graphModel,
    } = this.props;
    const {
      textEditElement,
    } = graphModel;
    if (this.ref.current) {
      this.ref.current.focus();
      this.placeCaretAtEnd(this.ref.current);
    }
    if (this.__prevText.id !== '' && !textEditElement) {
      const { text, id } = this.__prevText;
      graphModel.setElementTextById(id, text);
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
