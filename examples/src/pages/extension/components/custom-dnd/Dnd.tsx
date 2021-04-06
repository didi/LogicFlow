import React from 'react';
import ReactDOM from 'react-dom';
import DndTool from './DndTool';
import LogicFlow, { Extension } from '@logicflow/core';

const Dnd: Extension = {
  name: 'dnd',
  install() { },
  render(lf: LogicFlow, domContainer: HTMLElement) {
    ReactDOM.render(<DndTool lf={lf} />, domContainer);
  },
};

export default Dnd;
export {
  Dnd
};