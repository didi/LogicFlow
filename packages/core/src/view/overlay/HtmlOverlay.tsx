/**
 * HtmlOverlay和CanvasOverlay放大，缩小，平移保持一致。
 * 但是这里是放的是HTML标签而不是SVG。
 * 目前这里可以放文本。
 * 之后可以考虑放图片，范围框等。
 */
import { h, Component } from 'preact';
import GraphModel from '../../model/GraphModel';
// import getTransform from './getTransformHoc';
// import { GraphTransform } from '../../type';
import { observer } from '../../util/stateUtil';

type IProps = {
  graphModel: GraphModel
};
// type InjectedProps = IProps & {
//   transformStyle: GraphTransform
// };

@observer
class HtmlOverlay extends Component<IProps> {
  // get InjectedProps() {
  //   return this.props as InjectedProps;
  // }
  render() {
    const {
      graphModel: {
        transformModel,
      },
    } = this.props;
    const { transform } = transformModel.getTransformStyle();
    const { children } = this.props;

    return (
      <div className="lf-html-overlay">
        <div className="lf-html-overlay__transform" style={transform}>
          {
            children
          }
        </div>
      </div>
    );
  }
}

export default HtmlOverlay;
