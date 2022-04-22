import { observable, action, makeObservable } from 'mobx';
import { EventType } from '../constant/constant';
import EventEmitter from '../event/eventEmitter';
import { PointTuple, ZoomParam } from '../type';

export interface TransformInterface {
  SCALE_X: number;
  SKEW_Y: number;
  SKEW_X: number;
  SCALE_Y: number;
  TRANSLATE_X: number;
  TRANSLATE_Y: number;
  ZOOM_SIZE: number;
  MINI_SCALE_SIZE: number; // 缩小的最小值
  MAX_SCALE_SIZE: number; // 放大的最大值
  zoom: (isZoomOut: ZoomParam) => string;
  HtmlPointToCanvasPoint: (point: PointTuple) => PointTuple;
  CanvasPointToHtmlPoint: (point: PointTuple) => PointTuple;
  moveCanvasPointByHtml: (point: PointTuple, x: number, y: number) => PointTuple;
  getTransformStyle: () => { transform: string };
}

export default class TransformModel implements TransformInterface {
  MINI_SCALE_SIZE = 0.2;
  MAX_SCALE_SIZE = 16;
  SCALE_X = 1;
  SKEW_Y = 0;
  SKEW_X = 0;
  SCALE_Y = 1;
  TRANSLATE_X = 0;
  TRANSLATE_Y = 0;
  ZOOM_SIZE = 0.04;
  eventCenter: EventEmitter;
  constructor(eventCenter) {
    makeObservable(this, {
      SCALE_X: observable,
      SKEW_Y: observable,
      SKEW_X: observable,
      SCALE_Y: observable,
      TRANSLATE_X: observable,
      TRANSLATE_Y: observable,
      ZOOM_SIZE: observable,
      zoom: action,
      resetZoom: action,
      translate: action,
      focusOn: action,
    });

    this.eventCenter = eventCenter;
  }
  setZoomMiniSize(size: number): void {
    this.MINI_SCALE_SIZE = size;
  }

  setZoomMaxSize(size: number): void {
    this.MAX_SCALE_SIZE = size;
  }

  /**
   * 将最外层graph上的点基于缩放转换为canvasOverlay层上的点。
   * @param param0 HTML点
   */
  HtmlPointToCanvasPoint([x, y]: PointTuple): PointTuple {
    return [(x - this.TRANSLATE_X) / this.SCALE_X, (y - this.TRANSLATE_Y) / this.SCALE_Y];
  }

  /**
   * 将最外层canvasOverlay层上的点基于缩放转换为graph上的点。
   * @param param0 HTML点
   */
  CanvasPointToHtmlPoint([x, y]: PointTuple): PointTuple {
    return [x * this.SCALE_X + this.TRANSLATE_X, y * this.SCALE_Y + this.TRANSLATE_Y];
  }

  /**
   * 将一个在canvas上的点，向x轴方向移动directionX距离，向y轴方向移动directionY距离。
   * 因为canvas可能被缩小或者放大了，所以其在canvas层移动的距离需要计算上缩放的量。
   * @param point 点
   * @param directionX x轴距离
   * @param directionY y轴距离
   */
  moveCanvasPointByHtml([x, y]: PointTuple, directionX: number, directionY: number): PointTuple {
    return [x + directionX / this.SCALE_X, y + directionY / this.SCALE_Y];
  }

  /**
   * 根据缩放情况，获取缩放后的delta距离
   * @param deltaX x轴距离变化
   * @param deltaY y轴距离变化
   */
  fixDeltaXY(deltaX: number, deltaY: number): PointTuple {
    return [deltaX / this.SCALE_X, deltaY / this.SCALE_Y];
  }
  /**
   * 基于当前的缩放，获取画布渲染样式transform值
   */
  getTransformStyle() {
    const matrixString = [this.SCALE_X, this.SKEW_Y, this.SKEW_X, this.SCALE_Y, this.TRANSLATE_X, this.TRANSLATE_Y].join(',');
    return {
      transform: `matrix(${matrixString})`,
    };
  }
  /**
   * 放大缩小图形
   * @param zoomSize 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小
   * @param point 缩放的原点
   * @returns {string} -放大缩小的比例
   */
  zoom(zoomSize: ZoomParam = false, point?: PointTuple): string {
    let newScaleX = this.SCALE_X;
    let newScaleY = this.SCALE_Y;
    if (zoomSize === true) {
      newScaleX += this.ZOOM_SIZE;
      newScaleY += this.ZOOM_SIZE;
    } else if (zoomSize === false) {
      newScaleX -= this.ZOOM_SIZE;
      newScaleY -= this.ZOOM_SIZE;
    } else if (typeof zoomSize === 'number') {
      newScaleX = zoomSize;
      newScaleY = zoomSize;
    }
    if (newScaleX < this.MINI_SCALE_SIZE || newScaleX > this.MAX_SCALE_SIZE) {
      return `${this.SCALE_X * 100}%`;
    }
    if (point) {
      this.TRANSLATE_X -= (newScaleX - this.SCALE_X) * point[0];
      this.TRANSLATE_Y -= (newScaleY - this.SCALE_Y) * point[1];
    }
    this.SCALE_X = newScaleX;
    this.SCALE_Y = newScaleY;
    this.emitGraphTransform('zoom');
    return `${this.SCALE_X * 100}%`;
  }
  private emitGraphTransform(type) {
    this.eventCenter.emit(EventType.GRAPH_TRANSFORM, {
      type,
      transform: {
        SCALE_X: this.SCALE_X,
        SKEW_Y: this.SKEW_Y,
        SKEW_X: this.SKEW_X,
        SCALE_Y: this.SCALE_Y,
        TRANSLATE_X: this.TRANSLATE_X,
        TRANSLATE_Y: this.TRANSLATE_Y,
      },
    });
  }
  resetZoom(): void {
    this.SCALE_X = 1;
    this.SCALE_Y = 1;
    this.emitGraphTransform('resetZoom');
  }

  translate(x: number, y: number) {
    this.TRANSLATE_X += x;
    this.TRANSLATE_Y += y;
    this.emitGraphTransform('translate');
  }

  /**
   * 将图形定位到画布中心
   * @param targetX 图形当前x坐标
   * @param targetY 图形当前y坐标
   * @param width 画布宽
   * @param height 画布高
   */
  focusOn(targetX: number, targetY: number, width: number, height: number) {
    const [x, y] = this.CanvasPointToHtmlPoint([targetX, targetY]);
    const [deltaX, deltaY] = [width / 2 - x, height / 2 - y];
    this.TRANSLATE_X += deltaX;
    this.TRANSLATE_Y += deltaY;
    this.emitGraphTransform('focusOn');
  }
}
