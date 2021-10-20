import { h } from 'preact';

type IProps = {
  d: string,
  strokeWidth: number,
  stroke: string,
  fill: string,
  strokeDasharray?: string,
};

Path.defaultProps = {
  strokeDasharray: '',
};

function Path(props: IProps) {
  const attrs = {
    d: '',
    // ...props,
  };
  Object.entries(props).forEach(([k, v]) => {
    const valueType = typeof v;
    if (valueType !== 'object') {
      attrs[k] = v;
    }
  });
  return (
    <path {...attrs} />
  );
}

export default Path;
