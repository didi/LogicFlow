import { h } from 'preact';
import * as type from '../../type';

// TODO: 常用的属性集合定一个interface
type IProps = {
  className?: string,
  radius?: number,
  stroke?: string,
  strokeDasharray?: string,
} & type.Point & type.Size;

// TODO: 默认样式引入

export default function Rect(props: IProps) {
  const {
    x,
    y,
    width,
    height,
    radius,
    className,
  } = props;

  const leftTopX = x - width / 2;
  const leftTopY = y - height / 2;

  const attrs = {
    // default
    width: 10,
    height: 10,
    cx: 0,
    cy: 0,
    rx: radius || 0,
    ry: radius || 0,
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: '1px',
    stroke: '#000',
    strokeOpacity: 1,
    className: `lf-basic-shape ${className}`,
    ...props,
    x: leftTopX,
    y: leftTopY,
  };

  return (
    <rect {...attrs} />
  );
}

Rect.defaultProps = {
  radius: 0,
  stroke: '',
  strokeDasharray: '',
  className: '',
};
