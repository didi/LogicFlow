import { h } from 'preact';

function Polyline(props) {
  const attrs = {
    // default
    points: '',
    fill: 'none',
    ...props,
  };
  return (
    <polyline {...attrs} />
  );
}

export default Polyline;
