import { h } from 'preact';

type IProps = {
  d: string,
  [key: string]: any;
};

function Path(props: IProps) {
  const attrs = {
    d: '',
    ...props,
  };
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'style') {
      attrs[k] = v;
    } else {
      const valueType = typeof v;
      if (valueType !== 'object') {
        attrs[k] = v;
      }
    }
  });
  return (
    <path {...attrs} />
  );
}

export default Path;
