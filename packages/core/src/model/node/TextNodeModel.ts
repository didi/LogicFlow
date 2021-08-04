import { computed, observable } from 'mobx';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { defaultTheme } from '../../constant/DefaultTheme';
import { getSvgTextWidthHeight } from '../../util/node';

class TextNodeModel extends BaseNodeModel {
  modelType = ModelType.TEXT_NODE;
  @observable fontSize = defaultTheme.text.fontSize;
  @observable fontFamily = defaultTheme.text.fontFamily;
  @observable fontWeight = defaultTheme.text.fontWeight;

  constructor(data, graphModel: GraphModel) {
    super(data, graphModel, 'text');
  }
  @computed get width(): number {
    const rows = String(this.text.value).split(/[\r\n]/g);
    const { width } = getSvgTextWidthHeight({
      rows,
      fontSize: this.fontSize,
      rowsLength: rows.length,
    });
    const textWidth = width > 100 ? width : 100;
    return textWidth;
  }
  @computed get height(): number {
    const rows = String(this.text.value).split(/[\r\n]/g);
    const { height } = getSvgTextWidthHeight({
      rows,
      fontSize: this.fontSize,
      rowsLength: rows.length,
    });
    const textHeight = height > 20 ? height : 20;
    return textHeight;
  }
}

export { TextNodeModel };
export default TextNodeModel;
