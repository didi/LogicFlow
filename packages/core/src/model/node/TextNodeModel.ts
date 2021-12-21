import { computed, observable } from 'mobx';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import { defaultTheme } from '../../constant/DefaultTheme';
import { getSvgTextWidthHeight } from '../../util/node';

class TextNodeModel extends BaseNodeModel {
  modelType = ModelType.TEXT_NODE;
  @observable fontSize = defaultTheme.text.fontSize;
  getNodeStyle() {
    const style = super.getNodeStyle();
    return {
      ...style,
      ...this.graphModel.theme.text,
    };
  }
  @computed get width(): number {
    const rows = String(this.text.value).split(/[\r\n]/g);
    const { width } = getSvgTextWidthHeight({
      rows,
      fontSize: this.fontSize,
      rowsLength: rows.length,
    });
    return width;
  }
  @computed get height(): number {
    const rows = String(this.text.value).split(/[\r\n]/g);
    const { height } = getSvgTextWidthHeight({
      rows,
      fontSize: this.fontSize,
      rowsLength: rows.length,
    });
    return height;
  }
}

export { TextNodeModel };
export default TextNodeModel;
