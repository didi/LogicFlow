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
    ...props,
  };

  return (
    <path {...attrs} />
  );
}

export default Path;
