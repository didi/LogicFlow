import { throttle } from 'lodash-es';

interface MiniMapStaticOption {
  width?: number,
  height?: number,
  isShowHeader?: boolean,
  isShowCloseIcon?: boolean,
  leftPosition?: number,
  rightPosition?: number,
  topPosition?: number,
  bottomPosition?: number,
  headerTitle?: string,
}
class MiniMap {
  static pluginName = 'miniMap';
  static width = 150;
  static height = 220;
  static viewPortWidth = 150;
  static viewPortHeight = 75;
  static isShowHeader = true;
  static isShowCloseIcon = true;
  static leftPosition = 0;
  static topPosition = 0;
  static rightPosition = null;
  static bottomPosition = null;
  static headerTitle = '导航';
  private lf = null;
  private container = null;
  private miniMapWrap = null;
  private miniMapContainer = null;
  private lfMap = null;
  private viewport = null;
  private width = 150;
  private height = 220;
  private leftPosition = undefined;
  private topPosition = undefined;
  private rightPosition = undefined;
  private bottomPosition = undefined;
  private miniMapWidth =450;
  private miniMapHeight = 660;
  private viewPortTop = 0;
  private viewPortLeft = 0;
  private startPosition = null;
  private viewPortScale = 1;
  private viewPortWidth = 150;
  private viewPortHeight = 75;
  private resetDataX = 0;
  private resetDataY = 0;
  private LogicFlow = null;
  private isShow = false;
  private isShowHeader = true;
  private isShowCloseIcon = true;
  private dragging = false;
  private disabledPlugins = ['miniMap', 'control', 'selectionSelect'];
  constructor({ lf, LogicFlow, options }) {
    this.lf = lf;
    if (options && options.MiniMap) {
      this.setOption(options);
    }
    this.miniMapWidth = lf.graphModel.width;
    this.miniMapHeight = (lf.graphModel.width * this.height) / this.width;
    this.LogicFlow = LogicFlow;
    this.initMiniMap();
  }
  render(lf, container) {
    this.container = container;
    this.lf.on('history:change', () => {
      if (this.isShow) {
        this.setView();
      }
    });
    this.lf.on('graph:transform', throttle(() => {
      // 小地图已展示，并且没有拖拽小地图视口
      if (this.isShow && !this.dragging) {
        this.setView();
      }
    }, 300));
  }
  init(option) {
    this.disabledPlugins = this.disabledPlugins.concat(
      option.disabledPlugins || [],
    );
  }
  /**
   * 显示mini map
  */
  show = (leftPosition?: number, topPosition?: number) => {
    this.setView();
    if (!this.isShow) {
      this.createMiniMap(leftPosition, topPosition);
    }
    this.isShow = true;
  };
  /**
   * 隐藏mini map
   */
  hide = () => {
    if (this.isShow) {
      this.removeMiniMap();
    }
    this.isShow = false;
  };
  reset = () => {
    this.lf.resetTranslate();
    this.lf.resetZoom();
    this.hide();
    this.show();
  };
  private setOption(options) {
    const {
      width = 150,
      height = 220,
      isShowHeader = true,
      isShowCloseIcon = true,
      leftPosition = 0,
      topPosition = 0,
      rightPosition,
      bottomPosition,
    } = options.MiniMap as MiniMapStaticOption;
    this.width = width;
    this.height = height;
    this.isShowHeader = isShowHeader;
    this.isShowCloseIcon = isShowCloseIcon;
    this.viewPortWidth = width;
    this.leftPosition = leftPosition;
    this.topPosition = topPosition;
    this.rightPosition = rightPosition;
    this.bottomPosition = bottomPosition;
  }
  private initMiniMap() {
    const miniMapWrap = document.createElement('div');
    miniMapWrap.className = 'lf-mini-map-graph';
    miniMapWrap.style.width = `${this.width + 4}px`;
    miniMapWrap.style.height = `${this.height}px`;
    this.lfMap = new this.LogicFlow({
      container: miniMapWrap,
      isSilentMode: true,
      stopZoomGraph: true,
      stopScrollGraph: true,
      stopMoveGraph: true,
      hideAnchors: true,
      hoverOutline: false,
      disabledPlugins: this.disabledPlugins,
    });
    // minimap中禁用adapter。
    this.lfMap.adapterIn = (a) => a;
    this.lfMap.adapterOut = (a) => a;
    this.miniMapWrap = miniMapWrap;
    this.createViewPort();
    miniMapWrap.addEventListener('click', this.mapClick);
  }
  private createMiniMap(left?: number, top?: number) {
    const miniMapContainer = document.createElement('div');
    miniMapContainer.appendChild(this.miniMapWrap);
    if (typeof left !== 'undefined' || typeof top !== 'undefined') {
      miniMapContainer.style.left = `${left || 0}px`;
      miniMapContainer.style.top = `${top || 0}px`;
    } else {
      if (typeof this.rightPosition !== 'undefined') {
        miniMapContainer.style.right = `${this.rightPosition}px`;
      } else if (typeof this.leftPosition !== 'undefined') {
        miniMapContainer.style.left = `${this.leftPosition}px`;
      }
      if (typeof this.bottomPosition !== 'undefined') {
        miniMapContainer.style.bottom = `${this.bottomPosition}px`;
      } else if (typeof this.topPosition !== 'undefined') {
        miniMapContainer.style.top = `${this.topPosition}px`;
      }
    }
    miniMapContainer.style.position = 'absolute';
    miniMapContainer.className = 'lf-mini-map';
    if (!this.isShowCloseIcon) {
      miniMapContainer.classList.add('lf-mini-map-no-close-icon');
    }
    if (!this.isShowHeader) {
      miniMapContainer.classList.add('lf-mini-map-no-header');
    }
    this.container.appendChild(miniMapContainer);
    this.miniMapWrap.appendChild(this.viewport);

    const header = document.createElement('div');
    header.className = 'lf-mini-map-header';
    header.innerText = MiniMap.headerTitle;
    miniMapContainer.appendChild(header);

    const close = document.createElement('span');
    close.className = 'lf-mini-map-close';
    close.addEventListener('click', this.hide);
    miniMapContainer.appendChild(close);
    this.miniMapContainer = miniMapContainer;
  }
  private removeMiniMap() {
    this.container.removeChild(this.miniMapContainer);
  }
  /**
   * 计算所有图形一起，占领的区域范围。
   * @param data
   */
  private getBounds(data) {
    let left = 0;
    let right = this.miniMapWidth;
    let top = 0;
    let bottom = this.miniMapHeight;
    const { nodes } = data;
    if (nodes && nodes.length > 0) {
      // 因为获取的节点不知道真实的宽高，这里需要补充一点数值
      nodes.forEach(({ x, y, width = 200, height = 200 }) => {
        const nodeLeft = x - width / 2;
        const nodeRight = x + width / 2;
        const nodeTop = y - height / 2;
        const nodeBottom = y + height / 2;
        left = nodeLeft < left ? nodeLeft : left;
        right = nodeRight > right ? nodeRight : right;
        top = nodeTop < top ? nodeTop : top;
        bottom = nodeBottom > bottom ? nodeBottom : bottom;
      });
    }
    return {
      left,
      top,
      bottom,
      right,
    };
  }
  /**
   * 将负值的平移转换为正值。
   * 保证渲染的时候，minimap能完全展示。
   * 获取将画布所有元素平移到0，0开始时，所有节点数据
   */
  private resetData(data) {
    const { nodes, edges } = data;
    let left = 0;
    let top = 0;
    if (nodes && nodes.length > 0) {
      // 因为获取的节点不知道真实的宽高，这里需要补充一点数值
      nodes.forEach(({ x, y, width = 200, height = 200 }) => {
        const nodeLeft = x - width / 2;
        const nodeTop = y - height / 2;
        left = nodeLeft < left ? nodeLeft : left;
        top = nodeTop < top ? nodeTop : top;
      });
      if (left < 0 || top < 0) {
        this.resetDataX = left;
        this.resetDataY = top;
        nodes.forEach((node) => {
          node.x = node.x - left;
          node.y = node.y - top;
          if (node.text) {
            node.text.x = node.text.x - left;
            node.text.y = node.text.y - top;
          }
        });
        edges.forEach((edge) => {
          if (edge.startPoint) {
            edge.startPoint.x = edge.startPoint.x - left;
            edge.startPoint.y = edge.startPoint.y - top;
          }
          if (edge.endPoint) {
            edge.endPoint.x = edge.endPoint.x - left;
            edge.endPoint.y = edge.endPoint.y - top;
          }
          if (edge.text) {
            edge.text.x = edge.text.x - left;
            edge.text.y = edge.text.y - top;
          }
          if (edge.pointsList) {
            edge.pointsList.forEach((point) => {
              point.x = point.x - left;
              point.y = point.y - top;
            });
          }
        });
      }
    }
    return data;
  }
  /**
   * 显示导航
   * 显示视口范围
   * 1. 基于画布的范围比例，设置视口范围比例。宽度默认为导航宽度。
   */
  private setView() {
    // 1. 获取到图中所有的节点中的位置，将其偏移到原点开始（避免节点位置为负的时候无法展示问题）。
    const graphData = this.lf.getGraphRawData();
    const data = this.resetData(graphData);
    // 由于随时都会有新节点注册进来，需要同步将注册的
    const { viewMap } : { viewMap: Map<string, any> } = this.lf;
    const { modelMap } : { modelMap: Map<string, any> } = this.lf.graphModel;
    const { viewMap: minimapViewMap } : { viewMap: Map<string, any> } = this.lfMap;
    // todo: no-restricted-syntax
    for (const key of viewMap.keys()) {
      if (!minimapViewMap.has(key)) {
        this.lfMap.setView(key, viewMap.get(key));
        this.lfMap.graphModel.modelMap.set(key, modelMap.get(key));
      }
    }
    this.lfMap.render(data);
    // 2. 将偏移后的数据渲染到minimap画布上
    // 3. 计算出所有节点在一起的边界。
    const { left, top, right, bottom } = this.getBounds(data);
    // 4. 计算所有节点的边界与minimap看板的边界的比例.
    const realWidthScale = this.width / (right - left);
    const realHeightScale = this.height / (bottom - top);
    // 5. 取比例最小的值，将渲染的画布缩小对应比例。
    const innerStyle = this.miniMapWrap.firstChild.style;
    const scale = Math.min(realWidthScale, realHeightScale);
    innerStyle.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`;
    innerStyle.transformOrigin = 'left top';
    innerStyle.height = `${bottom - Math.min(top, 0)}px`;
    innerStyle.width = `${right - Math.min(left, 0)}px`;
    this.viewPortScale = scale;
    this.setViewPort(scale, {
      left,
      top,
      right,
      bottom,
    });
  }
  // 设置视口
  private setViewPort(scale, { left, right, top, bottom }) {
    const viewStyle = this.viewport.style;
    viewStyle.width = `${this.viewPortWidth}px`;
    viewStyle.height = `${
      (this.viewPortWidth) / (this.lf.graphModel.width / this.lf.graphModel.height)
    }px`;
    const { TRANSLATE_X, TRANSLATE_Y, SCALE_X, SCALE_Y } = this.lf.getTransform();
    const realWidth = right - left;
    // 视口宽 = 小地图宽 / (所有元素一起占据的真实宽 / 绘布宽)
    const viewPortWidth = (this.width) / (realWidth / this.lf.graphModel.width);
    // 实际视口宽 = 小地图宽 * 占宽度比例
    const realViewPortWidth = this.width * (viewPortWidth / this.width);
    const graphRatio = (this.lf.graphModel.width / this.lf.graphModel.height);
    // 视口实际高 = 视口实际宽 / (绘布宽 / 绘布高)
    const realViewPortHeight = realViewPortWidth / graphRatio;
    const graphData = this.lf.getGraphRawData();
    const { left: graphLeft, top: graphTop } = this.getBounds(graphData);
    let viewportLeft = graphLeft;
    let viewportTop = graphTop;
    viewportLeft += TRANSLATE_X / SCALE_X;
    viewportTop += TRANSLATE_Y / SCALE_Y;
    this.viewPortTop = viewportTop > 0 ? 0 : (-viewportTop * scale);
    this.viewPortLeft = viewportLeft > 0 ? 0 : (-viewportLeft * scale);
    this.viewPortWidth = realViewPortWidth;
    this.viewPortHeight = realViewPortHeight;
    viewStyle.top = `${this.viewPortTop}px`;
    viewStyle.left = `${this.viewPortLeft}px`;
    viewStyle.width = `${realViewPortWidth / SCALE_X}px`;
    viewStyle.height = `${realViewPortHeight / SCALE_Y}px`;
  }
  // 预览视窗
  private createViewPort() {
    const div = document.createElement('div');
    div.className = 'lf-minimap-viewport';
    div.addEventListener('mousedown', this.startDrag);
    this.viewport = div;
  }
  private startDrag = (e) => {
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('mouseup', this.drop);
    this.startPosition = {
      x: e.x,
      y: e.y,
    };
  };
  private moveViewport = (top, left) => {
    const viewStyle = this.viewport.style;
    this.viewPortTop = top;
    this.viewPortLeft = left;
    viewStyle.top = `${this.viewPortTop}px`;
    viewStyle.left = `${this.viewPortLeft}px`;
  };
  private drag = (e) => {
    this.dragging = true;
    const top = this.viewPortTop + e.y - this.startPosition.y;
    const left = this.viewPortLeft + e.x - this.startPosition.x;
    this.moveViewport(top, left);
    this.startPosition = {
      x: e.x,
      y: e.y,
    };
    const centerX = (this.viewPortLeft + this.viewPortWidth / 2)
      / this.viewPortScale;
    const centerY = (this.viewPortTop + this.viewPortHeight / 2)
      / this.viewPortScale;
    this.lf.focusOn({
      coordinate: {
        x: centerX + this.resetDataX,
        y: centerY + this.resetDataY,
      },
    });
  };
  private drop = () => {
    document.removeEventListener('mousemove', this.drag);
    document.removeEventListener('mouseup', this.drop);
    let top = this.viewPortTop;
    let left = this.viewPortLeft;
    if (this.viewPortLeft > this.width) {
      left = this.width - this.viewPortWidth;
    }
    if (this.viewPortTop > this.height) {
      top = this.height - this.viewPortHeight;
    }
    if (this.viewPortLeft < -this.width) {
      left = 0;
    }
    if (this.viewPortTop < -this.height) {
      top = 0;
    }
    this.moveViewport(top, left);
  };
  private mapClick = (e) => {
    if (this.dragging) {
      this.dragging = false;
    } else {
      const { layerX, layerY } = e;
      const ViewPortCenterX = layerX;
      const ViewPortCenterY = layerY;
      const graphData = this.lf.getGraphRawData();
      const { left, top } = this.getBounds(graphData);
      const resetGraphX = left + ViewPortCenterX / this.viewPortScale;
      const resetGraphY = top + ViewPortCenterY / this.viewPortScale;
      this.lf.focusOn({ coordinate: { x: resetGraphX, y: resetGraphY } });
    }
  };
}

export default MiniMap;

export { MiniMap };
