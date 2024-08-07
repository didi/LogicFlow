import { h } from 'preact';
import * as type from '../../type';

// TODO: 常用的属性集合定一个interface
type IProps = {
  className?: string,
  radius?: number,
} & type.Point & type.Size;

// TODO: 默认样式引入

export default function Rect(props: IProps) {
  const {
    x,
    y,
    width,
    height,
    className,
    radius,
  } = props;

  const leftTopX = x - width / 2;
  const leftTopY = y - height / 2;
  const attrs: Record<string, any> = {};
  Object.entries(props).forEach(([k, v]) => {
    const valueType = typeof v;
    if (valueType !== 'object') {
      attrs[k] = v;
    }
  });

  if (className) {
    attrs.className = `lf-basic-shape ${className}`;
  } else {
    attrs.className = 'lf-basic-shape';
  }
  if (radius) {
    attrs.rx = radius;
    attrs.ry = radius;
  }
  attrs.x = leftTopX;
  attrs.y = leftTopY;
  return (
    <rect {...attrs} />
  );
}

Rect.defaultProps = {
  className: '',
  radius: '',
};
