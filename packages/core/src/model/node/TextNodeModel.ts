import { computed, makeObservable } from 'mobx';
import { cloneDeep } from 'lodash-es';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import { getSvgTextWidthHeight } from '../../util/node';

class TextNodeModel extends BaseNodeModel {
  modelType = ModelType.TEXT_NODE;

  constructor(data, graphModel) {
    super(data, graphModel);

    makeObservable(this, {
      width: computed,
      height: computed,
    });
  }

  getTextStyle() {
    const style = super.getTextStyle();
    const { text } = this.graphModel.theme;
    return {
      ...style,
      ...cloneDeep(text),
    };
  }
  get width(): number {
    const rows = String(this.text.value).split(/[\r\n]/g);
    const { fontSize } = this.getTextStyle();
    const { width } = getSvgTextWidthHeight({
      rows,
      fontSize,
      rowsLength: rows.length,
    });
    return width;
  }
  get height(): number {
    const rows = String(this.text.value).split(/[\r\n]/g);
    const { fontSize } = this.getTextStyle();
    const { height } = getSvgTextWidthHeight({
      rows,
      fontSize,
      rowsLength: rows.length,
    });
    return height;
  }
}

export { TextNodeModel };
export default TextNodeModel;
