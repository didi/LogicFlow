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
  __lf = null;
  __container = null;
  __miniMapWrap = null;
  __miniMapContainer = null;
  __lfMap = null;
  __viewport = null;
  __width = 150;
  __height = 220;
  __leftPosition = undefined;
  __topPosition = undefined;
  __rightPosition = undefined;
  __bottomPosition = undefined;
  __miniMapWidth =450;
  __miniMapHeight = 660;
  __viewPortTop = 0;
  __viewPortLeft = 0;
  __startPosition = null;
  __viewPortScale = 1;
  __viewPortWidth = 150;
  __viewPortHeight = 75;
  __resetDataX = 0;
  __resetDataY = 0;
  __LogicFlow = null;
  __isShow = false;
  __isShowHeader = true;
  __isShowCloseIcon = true;
  __draging = false;
  __disabledPlugins = ['miniMap', 'control', 'selectionSelect'];
  constructor({ lf, LogicFlow }) {
    this.__lf = lf;
    this.__width = MiniMap.width;
    this.__height = MiniMap.height;
    this.__isShowHeader = MiniMap.isShowHeader;
    this.__isShowCloseIcon = MiniMap.isShowCloseIcon;
    this.__viewPortWidth = MiniMap.viewPortWidth;
    this.__viewPortHeight = MiniMap.viewPortHeight;
    this.__leftPosition = MiniMap.leftPosition;
    this.__topPosition = MiniMap.topPosition;
    this.__rightPosition = MiniMap.rightPosition;
    this.__bottomPosition = MiniMap.bottomPosition;
    this.__miniMapWidth = lf.graphModel.width;
    this.__miniMapHeight = (lf.graphModel.width * this.__height) / this.__width;
    this.__LogicFlow = LogicFlow;
    this.__init();
  }
  static setOption(option: MiniMapStaticOption) {
    const options = Object.keys(option);
    options.forEach(item => {
      switch (item) {
        case 'width':
          MiniMap.width = option.width;
          MiniMap.viewPortWidth = option.width;
          break;
        case 'height':
          MiniMap.height = option.height;
          break;
        case 'isShowHeader':
          MiniMap.isShowHeader = option.isShowHeader;
          break;
        case 'isShowCloseIcon':
          MiniMap.isShowCloseIcon = option.isShowCloseIcon;
          break;
        case 'leftPosition':
          MiniMap.leftPosition = option.leftPosition;
          break;
        case 'topPosition':
          MiniMap.topPosition = option.topPosition;
          break;
        case 'rightPosition':
          MiniMap.rightPosition = option.rightPosition;
          break;
        case 'bottomPosition':
          MiniMap.bottomPosition = option.bottomPosition;
          break;
        case 'headerTitle':
          MiniMap.headerTitle = option.headerTitle;
          break;
        default:
          break;
      }
    });
  }
  render(lf, container) {
    this.__container = container;
    this.__lf.on('history:change', () => {
      if (this.__isShow) {
        this.__setView();
      }
    });
    this.__lf.on('graph:transform', throttle(() => {
      if (this.__isShow) {
        this.__setView();
      }
    }, 300));
  }
  init(option) {
    this.__disabledPlugins = this.__disabledPlugins.concat(
      option.disabledPlugins || [],
    );
  }
  /**
   * 显示mini map
  */
  show = (leftPosition?: number, topPosition?: number) => {
    this.__setView();
    if (!this.__isShow) {
      this.__createMiniMap(leftPosition, topPosition);
    }
    this.__isShow = true;
  };
  /**
   * 隐藏mini map
   */
  hide = () => {
    if (this.__isShow) {
      this.__removeMiniMap();
    }
    this.__isShow = false;
  };
  reset = () => {
    this.__lf.resetTranslate();
    this.__lf.resetZoom();
    this.hide();
    this.show();
  };
  __init() {
    const miniMapWrap = document.createElement('div');
    miniMapWrap.className = 'lf-mini-map-graph';
    miniMapWrap.style.width = `${this.__width + 4}px`;
    miniMapWrap.style.height = `${this.__height}px`;
    this.__lfMap = new this.__LogicFlow({
      width: this.__lf.graphModel.width,
      height: (this.__lf.graphModel.width * this.__height) / this.__width,
      container: miniMapWrap,
      isSilentMode: true,
      stopZoomGraph: true,
      stopScrollGraph: true,
      stopMoveGraph: true,
      hideAnchors: true,
      hoverOutline: false,
      disabledPlugins: this.__disabledPlugins,
    });
    // minimap中禁用adapter。
    this.__lfMap.adapterIn = (a) => a;
    this.__lfMap.adapterOut = (a) => a;
    this.__miniMapWrap = miniMapWrap;
    this.__createViewPort();
    miniMapWrap.addEventListener('click', this.__mapClick);
  }
  private __createMiniMap(left?: number, top?: number) {
    const miniMapContainer = document.createElement('div');
    const miniMapWrap = this.__miniMapWrap;
    miniMapContainer.appendChild(miniMapWrap);
    if (typeof left !== 'undefined' || typeof top !== 'undefined') {
      miniMapContainer.style.left = `${left || 0}px`;
      miniMapContainer.style.top = `${top || 0}px`;
    } else {
      if (typeof this.__rightPosition !== 'undefined') {
        miniMapContainer.style.right = `${this.__rightPosition}px`;
      } else if (typeof this.__leftPosition !== 'undefined') {
        miniMapContainer.style.left = `${this.__leftPosition}px`;
      }
      if (typeof this.__bottomPosition !== 'undefined') {
        miniMapContainer.style.bottom = `${this.__bottomPosition}px`;
      } else if (typeof this.__topPosition !== 'undefined') {
        miniMapContainer.style.top = `${this.__topPosition}px`;
      }
    }
    miniMapContainer.style.position = 'absolute';
    miniMapContainer.className = 'lf-mini-map';
    if (!this.__isShowCloseIcon) {
      miniMapContainer.classList.add('lf-mini-map-no-close-icon');
    }
    if (!this.__isShowHeader) {
      miniMapContainer.classList.add('lf-mini-map-no-header');
    }
    this.__container.appendChild(miniMapContainer);
    this.__miniMapWrap.appendChild(this.__viewport);

    const header = document.createElement('div');
    header.className = 'lf-mini-map-header';
    header.innerText = MiniMap.headerTitle;
    miniMapContainer.appendChild(header);

    const close = document.createElement('span');
    close.className = 'lf-mini-map-close';
    close.addEventListener('click', this.hide);
    miniMapContainer.appendChild(close);
    this.__miniMapContainer = miniMapContainer;
  }
  __removeMiniMap() {
    this.__container.removeChild(this.__miniMapContainer);
  }
  /**
   * 计算所有图形一起，占领的区域范围。
   * @param data
   */
  __getBounds(data) {
    let left = 0;
    let right = this.__miniMapWidth;
    let top = 0;
    let bottom = this.__miniMapHeight;
    const { nodes } = data;
    if (nodes && nodes.length > 0) {
      // 因为获取的节点不知道真实的宽高，这里需要补充一点数值
      nodes.forEach(({ x, y, width = 200, height = 200 }) => {
        const nodeLeft = x - width / 2;
        const noderight = x + width / 2;
        const nodeTop = y - height / 2;
        const nodeBottom = y + height / 2;
        left = nodeLeft < left ? nodeLeft : left;
        right = noderight > right ? noderight : right;
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
  __resetData(data) {
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
        this.__resetDataX = left;
        this.__resetDataY = top;
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
  __setView() {
    // 1. 获取到图中所有的节点中的位置，将其偏移到原点开始（避免节点位置为负的时候无法展示问题）。
    const graphData = this.__lf.getGraphRawData();
    const data = this.__resetData(graphData);
    // 由于随时都会有新节点注册进来，需要同步将注册的
    const { viewMap } : { viewMap: Map<string, any> } = this.__lf;
    const { modelMap } : { modelMap: Map<string, any> } = this.__lf.graphModel;
    const { viewMap: minimapViewMap } : { viewMap: Map<string, any> } = this.__lfMap;
    // todo: no-restricted-syntax
    for (const key of viewMap.keys()) {
      if (!minimapViewMap.has(key)) {
        this.__lfMap.setView(key, viewMap.get(key));
        this.__lfMap.graphModel.modelMap.set(key, modelMap.get(key));
      }
    }
    this.__lfMap.render(data);
    // 2. 将偏移后的数据渲染到minimap画布上
    // 3. 计算出所有节点在一起的边界。
    const { left, top, right, bottom } = this.__getBounds(data);
    // 4. 计算所有节点的边界与minimap看板的边界的比例.
    const realWidthScale = this.__width / (right - left);
    const realHeightScale = this.__height / (bottom - top);
    // 5. 取比例最小的值，将渲染的画布缩小对应比例。
    const innerStyle = this.__miniMapWrap.firstChild.style;
    const scale = Math.min(realWidthScale, realHeightScale);
    innerStyle.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`;
    innerStyle.transformOrigin = 'left top';
    innerStyle.height = `${bottom - Math.min(top, 0)}px`;
    innerStyle.width = `${right - Math.min(left, 0)}px`;
    this.__viewPortScale = scale;
    this.__setViewPort(scale, {
      left,
      top,
      right,
      bottom,
    });
  }
  // 设置视口
  __setViewPort(scale, { left, right, top, bottom }) {
    const viewStyle = this.__viewport.style;
    viewStyle.width = `${this.__viewPortWidth}px`;
    viewStyle.height = `${
      (this.__viewPortWidth) / (this.__lf.graphModel.width / this.__lf.graphModel.height)
    }px`;
    // top
    const { TRANSLATE_X, TRANSLATE_Y, SCALE_X, SCALE_Y } = this.__lf.getTransform();
    const realWidth = right - left;
    // 视口实际宽 = 视口默认宽 / (所有元素一起占据的真实宽 / 绘布宽)
    const viewPortWidth = (this.__width) / (realWidth / this.__lf.graphModel.width);
    const realViewPortWidth = MiniMap.viewPortWidth * (viewPortWidth / this.__width);
    // 视口实际高 = 视口实际宽 / (绘布宽 / 绘布高)
    const graphRatio = (this.__lf.graphModel.width / this.__lf.graphModel.height);
    const realViewPortHeight = realViewPortWidth / graphRatio;
    const graphData = this.__lf.getGraphRawData();
    const { left: graphLeft, top: graphTop } = this.__getBounds(graphData);
    let viewportLeft = 0;
    let viewportTop = 0;
    if (graphLeft < 0) {
      viewportLeft = graphLeft;
    }
    if (graphTop < 0) {
      viewportTop = graphTop;
    }
    viewportLeft += TRANSLATE_X / SCALE_X;
    viewportTop += TRANSLATE_Y / SCALE_Y;
    this.__viewPortTop = viewportTop > 0 ? 0 : (-viewportTop * scale) / SCALE_X;
    this.__viewPortLeft = viewportLeft > 0 ? 0 : (-viewportLeft * scale) / SCALE_X;
    this.__viewPortWidth = realViewPortWidth;
    this.__viewPortHeight = realViewPortHeight;
    viewStyle.top = `${this.__viewPortTop}px`;
    viewStyle.left = `${this.__viewPortLeft}px`;
    viewStyle.width = `${realViewPortWidth / SCALE_X}px`;
    viewStyle.height = `${realViewPortHeight / SCALE_Y}px`;
  }
  // 预览视窗
  __createViewPort() {
    const div = document.createElement('div');
    div.className = 'lf-minimap-viewport';
    div.addEventListener('mousedown', this.__startDrag);
    this.__viewport = div;
  }
  __startDrag = (e) => {
    document.addEventListener('mousemove', this.__drag);
    document.addEventListener('mouseup', this.__drop);
    this.__startPosition = {
      x: e.x,
      y: e.y,
    };
  };
  moveViewport = (top, left) => {
    const viewStyle = this.__viewport.style;
    this.__viewPortTop = top;
    this.__viewPortLeft = left;
    viewStyle.top = `${this.__viewPortTop}px`;
    viewStyle.left = `${this.__viewPortLeft}px`;
  };
  __drag = (e) => {
    console.log('---__drag-----');
    this.__draging = true;
    const top = this.__viewPortTop + e.y - this.__startPosition.y;
    const left = this.__viewPortLeft + e.x - this.__startPosition.x;
    this.moveViewport(top, left);
    this.__startPosition = {
      x: e.x,
      y: e.y,
    };
    const centerX = (this.__viewPortLeft + this.__viewPortWidth / 2)
      / this.__viewPortScale;
    const centerY = (this.__viewPortTop + this.__viewPortHeight / 2)
      / this.__viewPortScale;
    this.__lf.focusOn({
      coordinate: {
        x: centerX + this.__resetDataX,
        y: centerY + this.__resetDataY,
      },
    });
  };
  __drop = () => {
    console.log('---__drop-----');
    document.removeEventListener('mousemove', this.__drag);
    document.removeEventListener('mouseup', this.__drop);
    let top = this.__viewPortTop;
    let left = this.__viewPortLeft;
    if (this.__viewPortLeft > this.__width) {
      left = this.__width - this.__viewPortWidth;
    }
    if (this.__viewPortTop > this.__height) {
      top = this.__height - this.__viewPortHeight;
    }
    if (this.__viewPortLeft < -this.__width) {
      left = 0;
    }
    if (this.__viewPortTop < -this.__height) {
      top = 0;
    }
    this.moveViewport(top, left);
  };
  __mapClick = (e) => {
    if (this.__draging) {
      this.__draging = false;
    } else {
      console.log('---__mapClick-----');
      const { layerX, layerY } = e;
      const ViewPortCenterX = layerX;
      const ViewPortCenterY = layerY;
      const graphData = this.__lf.getGraphRawData();
      const { left, top } = this.__getBounds(graphData);
      const resetGraphX = left + ViewPortCenterX / this.__viewPortScale;
      const resetGraphY = top + ViewPortCenterY / this.__viewPortScale;
      this.__lf.focusOn({ coordinate: { x: resetGraphX, y: resetGraphY } });
    }
  };
}

export default MiniMap;

export { MiniMap };
