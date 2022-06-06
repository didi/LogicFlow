import { h } from 'preact';

function Polyline(props) {
  const attrs = {
    points: '',
    fill: 'none',
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
    <polyline {...attrs} />
  );
}

export default Polyline;
