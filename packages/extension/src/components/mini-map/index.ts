class MiniMap {
  static pluginName = 'miniMap';
  __lf = null;
  __container = null;
  __miniMapWrap = null;
  __miniMapContainer = null;
  __lfMap = null;
  __viewport = null;
  __width = 150;
  __height = 220;
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
  __disabledPlugins = ['miniMap', 'control', 'selectionSelect'];
  constructor({ lf, LogicFlow }) {
    this.__lf = lf;
    this.__miniMapWidth = lf.graphModel.width;
    this.__miniMapHeight = (lf.graphModel.width * 220) / 150;
    this.__LogicFlow = LogicFlow;
    // 避免多次install的时候, _isShow状态被修改了
    this.__isShow = false;
    this.__init();
  }
  render(lf, container) {
    this.__container = container;
    const events = [
      'node:add',
      'node:delete',
      'edge:add',
      'edge:delete',
      'node:drop',
      'blank:drop',
    ];
    events.forEach((eventName) => {
      this.__lf.on(eventName, () => {
        if (this.__isShow) {
          this.__setView();
        }
      });
    });
  }
  init(option) {
    this.__disabledPlugins = this.__disabledPlugins.concat(
      option.disabledPlugins || [],
    );
  }
  /**
   * 显示mini map
   */
  show = (leftPosition, topPosition) => {
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
  __init() {
    const miniMapWrap = document.createElement('div');
    miniMapWrap.className = 'lf-mini-map-graph';
    miniMapWrap.style.width = `${this.__width}px`;
    miniMapWrap.style.height = `${this.__height}px`;
    this.__lfMap = new this.__LogicFlow({
      width: this.__lf.graphModel.width,
      height: (this.__lf.graphModel.width * 220) / 150,
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
  }
  __createMiniMap(left, top) {
    const miniMapContainer = document.createElement('div');
    const miniMapWrap = this.__miniMapWrap;
    miniMapContainer.appendChild(miniMapWrap);
    if (typeof left !== 'undefined' && typeof top !== 'undefined') {
      miniMapContainer.style.left = `${left}px`;
      miniMapContainer.style.top = `${top}px`;
    }
    miniMapContainer.style.position = 'absolute';
    miniMapContainer.className = 'lf-mini-map';
    this.__container.appendChild(miniMapContainer);
    this.__miniMapWrap.appendChild(this.__viewport);

    const header = document.createElement('div');
    header.className = 'lf-mini-map-header';
    header.innerText = '导航';
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
    const data = this.__resetData(this.__lf.getGraphRawData());
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
    viewStyle.width = `${this.__width - 4}px`;
    viewStyle.height = `${
      (this.__width - 4) / (this.__lf.graphModel.width / this.__lf.graphModel.height)
    }px`;
    // top
    const { TRANSLATE_X, TRANSLATE_Y } = this.__lf.getTransform();

    const realWidth = right - left;
    // 视口实际宽 = 视口默认宽 / (所有元素一起占据的真实宽 / 绘布宽)
    const realViewPortWidth = (this.__width - 4) / (realWidth / this.__lf.graphModel.width);
    // 视口实际高 = 视口实际宽 / (绘布宽 / 绘布高)
    const graphRatio = (this.__lf.graphModel.width / this.__lf.graphModel.height);
    const realViewPortHeight = realViewPortWidth / graphRatio;

    this.__viewPortTop = TRANSLATE_Y > 0 ? 0 : -TRANSLATE_Y * scale;
    this.__viewPortLeft = -TRANSLATE_X * scale;

    this.__viewPortWidth = realViewPortWidth;
    this.__viewPortHeight = realViewPortHeight;
    viewStyle.top = `${this.__viewPortTop}px`;
    viewStyle.left = `${this.__viewPortLeft}px`;
    viewStyle.width = `${realViewPortWidth}px`;
    viewStyle.height = `${realViewPortHeight}px`;
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
  __drag = (e) => {
    const viewStyle = this.__viewport.style;
    this.__viewPortTop += e.y - this.__startPosition.y;
    this.__viewPortLeft += e.x - this.__startPosition.x;
    viewStyle.top = `${this.__viewPortTop}px`;
    viewStyle.left = `${this.__viewPortLeft}px`;
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
    document.removeEventListener('mousemove', this.__drag);
    document.removeEventListener('mouseup', this.__drop);
  };
}

export default MiniMap;

export { MiniMap };
