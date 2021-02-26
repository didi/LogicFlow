import { noop } from 'lodash-es';
import { EventType } from '../constant/constant';
import EventEmitter from '../event/eventEmitter';
import BaseEdgeModel from '../model/edge/BaseEdgeModel';
import BaseNodeModel from '../model/node/BaseNodeModel';

const DOC = window.document;
const LEFT_MOUSE_BUTTON_CODE = 0;

function createDrag({
  onDragStart = noop,
  onDraging = noop,
  onDragEnd = noop,
  step = 1,
  isStopPropagation = true,
}) {
  let isDraging = false;
  let startX = 0;
  let startY = 0;
  let sumDeltaX = 0;
  let sumDeltaY = 0;
  function handleMouseMove(e: MouseEvent) {
    if (isStopPropagation) e.stopPropagation();

    if (!isDraging) return;
    sumDeltaX += e.x - startX;
    sumDeltaY += e.y - startY;
    startX = e.x;
    startY = e.y;
    if (Math.abs(sumDeltaX) > step || Math.abs(sumDeltaY) > step) {
      const remainderX = sumDeltaX % step;
      const remainderY = sumDeltaY % step;
      const deltaX = sumDeltaX - remainderX;
      const deltaY = sumDeltaY - remainderY;
      sumDeltaX = remainderX;
      sumDeltaY = remainderY;
      onDraging({ deltaX, deltaY, event: e });
    }
  }

  function handleMouseUp(e: MouseEvent) {
    if (isStopPropagation) e.stopPropagation();

    isDraging = false;

    DOC.removeEventListener('mousemove', handleMouseMove, false);
    DOC.removeEventListener('mouseup', handleMouseUp, false);
    return onDragEnd({ event: e });
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== LEFT_MOUSE_BUTTON_CODE) return;
    if (isStopPropagation) e.stopPropagation();

    isDraging = true;
    startX = e.x;
    startY = e.y;

    DOC.addEventListener('mousemove', handleMouseMove, false);
    DOC.addEventListener('mouseup', handleMouseUp, false);
    return onDragStart({ event: e });
  }

  return handleMouseDown;
}

// 支持拖拽的时候，按照指定step进行。
// 因为在绘制的过程中因为放大缩小，移动的真实的step则是变化的。
class StepDrag {
  onDragStart: Function;
  onDraging: Function;
  onDragEnd: Function;
  step: number;
  isStopPropagation: boolean;
  isDraging = false;
  startX = 0;
  startY = 0;
  sumDeltaX = 0;
  sumDeltaY = 0;
  eventType: string;
  eventCenter: EventEmitter | null;
  model?: BaseNodeModel | BaseEdgeModel;
  constructor({
    onDragStart = noop,
    onDraging = noop,
    onDragEnd = noop,
    eventType = '',
    eventCenter = null,
    step = 1,
    isStopPropagation = true,
    model = null,
  }) {
    this.onDragStart = onDragStart;
    this.onDraging = onDraging;
    this.onDragEnd = onDragEnd;
    this.step = step;
    this.isStopPropagation = isStopPropagation;
    this.eventType = eventType;
    this.eventCenter = eventCenter;
    this.model = model;
  }
  setStep(step: number) {
    this.step = step;
  }
  handleMouseDown = (e: MouseEvent) => {
    if (e.button !== LEFT_MOUSE_BUTTON_CODE) return;
    if (this.isStopPropagation) e.stopPropagation();
    this.isDraging = true;
    this.startX = e.x;
    this.startY = e.y;

    DOC.addEventListener('mousemove', this.handleMouseMove, false);
    DOC.addEventListener('mouseup', this.handleMouseUp, false);
    this.onDragStart({ event: e });
    const elementData = this.model?.getData();
    this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEDOWN`], { e, data: elementData });
  };
  handleMouseMove = (e: MouseEvent) => {
    if (this.isStopPropagation) e.stopPropagation();

    if (!this.isDraging) return;
    this.sumDeltaX += e.x - this.startX;
    this.sumDeltaY += e.y - this.startY;
    this.startX = e.x;
    this.startY = e.y;
    if (Math.abs(this.sumDeltaX) > this.step || Math.abs(this.sumDeltaY) > this.step) {
      const remainderX = this.sumDeltaX % this.step;
      const remainderY = this.sumDeltaY % this.step;
      const deltaX = this.sumDeltaX - remainderX;
      const deltaY = this.sumDeltaY - remainderY;
      this.sumDeltaX = remainderX;
      this.sumDeltaY = remainderY;
      this.onDraging({ deltaX, deltaY, event: e });
      const elementData = this.model?.getData();
      this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEMOVE`], { e, data: elementData });
    }
  };
  handleMouseUp = (e: MouseEvent) => {
    if (this.isStopPropagation) e.stopPropagation();
    this.isDraging = false;
    DOC.removeEventListener('mousemove', this.handleMouseMove, false);
    DOC.removeEventListener('mouseup', this.handleMouseUp, false);
    this.onDragEnd({ event: e });
    const elementData = this.model?.getData();
    this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEUP`], { e, data: elementData });
  };
}

export {
  createDrag,
  StepDrag,
};
