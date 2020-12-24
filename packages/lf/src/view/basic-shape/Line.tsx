import { h } from 'preact';

function Line(props) {
  const attrs = {
    // default
    x1: 10,
    y1: 10,
    x2: 20,
    y2: 20,
    stroke: 'black',
    ...props,
  };

  return (
    <line {...attrs} />
  );
}

export default Line;
