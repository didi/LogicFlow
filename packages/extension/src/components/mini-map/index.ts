import { Extension } from '@logicflow/core';

// interface MiniMapPlugin extends Extension {
//   init: (option) => void;
//   show: (leftPosition?: number, topPosition?: number) => void;
//   hide: () => void;
//   [x: string]: any;
// }

const MiniMap: Extension = {
  pluginName: 'minimap',
  __lf: null,
  __container: null,
  __miniMapWrap: null,
  __miniMapContainer: null,
  __lfMap: null,
  __viewport: null,
  __width: 150,
  __height: 220,
  __miniMapWidth: 450,
  __miniMapHeight: 660,
  __viewPortTop: 0,
  __viewPortLeft: 0,
  __startPosition: null,
  __viewPortScale: 1,
  __viewPortWidth: 150,
  __viewPortHeight: 75,
  __resetDataX: 0,
  __resetDataY: 0,
  __LogicFlow: null,
  __disabledPlugins: ['minimap', 'control', 'selection-select'],
  install(lf, LogicFlow) {
    MiniMap.__lf = lf;
    MiniMap.__miniMapWidth = lf.width;
    MiniMap.__miniMapHeight = (lf.width * 220) / 150;
    MiniMap.__LogicFlow = LogicFlow;
    this.__init();
    // 避免多次install的时候, _isShow状态被修改了
    MiniMap.__isShow = false;
  },
  init(option) {
    this.__disabledPlugins = this.__disabledPlugins.concat(
      option.disabledPlugins || [],
    );
  },
  render(lf, container) {
    MiniMap.__container = container;
    const events = [
      'node:add',
      'node:delete',
      'edge:add',
      'edge:delete',
      'node:drop',
      'blank:drop',
    ];
    events.forEach((eventName) => {
      MiniMap.__lf.on(eventName, () => {
        MiniMap.__setView();
      });
    });
  },
  show(leftPosition, topPosition) {
    MiniMap.__setView();
    if (!MiniMap.__isShow) {
      MiniMap.__createMiniMap(leftPosition, topPosition);
    }
    MiniMap.__isShow = true;
  },
  hide() {
    if (MiniMap.__isShow) {
      MiniMap.__removeMiniMap();
    }
    MiniMap.__isShow = false;
  },
  __init() {
    const miniMapWrap = document.createElement('div');
    miniMapWrap.className = 'lf-mini-map-graph';
    miniMapWrap.style.width = `${MiniMap.__width}px`;
    miniMapWrap.style.height = `${MiniMap.__height}px`;
    MiniMap.__lfMap = new MiniMap.__LogicFlow({
      width: MiniMap.__lf.width,
      height: (MiniMap.__lf.width * 220) / 150,
      container: miniMapWrap,
      isSilentMode: true,
      stopZoomGraph: true,
      stopScrollGraph: true,
      stopMoveGraph: true,
      hideAnchors: true,
      hoverOutline: false,
      disabledPlugins: MiniMap.__disabledPlugins,
    });
    // minimap中禁用adapter。
    MiniMap.__lfMap.adapterIn = (a) => a;
    MiniMap.__lfMap.adapterOut = (a) => a;
    MiniMap.__miniMapWrap = miniMapWrap;
    MiniMap.__createViewPort();
  },
  __createMiniMap(left, top) {
    const miniMapContainer = document.createElement('div');
    const miniMapWrap = MiniMap.__miniMapWrap;
    miniMapContainer.appendChild(miniMapWrap);
    if (typeof left !== 'undefined' && typeof top !== 'undefined') {
      miniMapContainer.style.left = `${left}px`;
      miniMapContainer.style.top = `${top}px`;
    }
    miniMapContainer.style.position = 'absolute';
    miniMapContainer.className = 'lf-mini-map';
    MiniMap.__container.appendChild(miniMapContainer);
    MiniMap.__miniMapWrap.appendChild(MiniMap.__viewport);

    const header = document.createElement('div');
    header.className = 'lf-mini-map-header';
    header.innerText = '导航';
    miniMapContainer.appendChild(header);

    const close = document.createElement('span');
    close.className = 'lf-mini-map-close';
    close.addEventListener('click', MiniMap.hide);
    miniMapContainer.appendChild(close);
    MiniMap.__miniMapContainer = miniMapContainer;
  },
  __removeMiniMap() {
    MiniMap.__container.removeChild(MiniMap.__miniMapContainer);
  },
  /**
   * 计算所有图形一起，占领的区域范围。
   * @param data
   */
  __getBounds(data) {
    let left = 0;
    let right = MiniMap.__miniMapWidth;
    let top = 0;
    let bottom = MiniMap.__miniMapHeight;
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
  },
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
        MiniMap.__resetDataX = left;
        MiniMap.__resetDataY = top;
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
  },
  /**
   * 显示导航
   * 显示视口范围
   * 1. 基于画布的范围比例，设置视口范围比例。宽度默认为导航宽度。
   */
  __setView() {
    // 1. 获取到图中所有的节点中的位置，将其偏移到原点开始（避免节点位置为负的时候无法展示问题）。
    const data = MiniMap.__resetData(MiniMap.__lf.getGraphRawData());
    // 由于随时都会有新节点注册进来，需要同步将注册的
    const { viewMap } : { viewMap: Map<string, any> } = MiniMap.__lf;
    const { modelMap } : { modelMap: Map<string, any> } = MiniMap.__lf.graphModel;
    const { viewMap: minimapViewMap } : { viewMap: Map<string, any> } = MiniMap.__lfMap;
    // todo: no-restricted-syntax
    for (const key of viewMap.keys()) {
      if (!minimapViewMap.has(key)) {
        MiniMap.__lfMap.setView(key, viewMap.get(key));
        MiniMap.__lfMap.graphModel.modelMap.set(key, modelMap.get(key));
      }
    }
    MiniMap.__lfMap.render(data);
    // 2. 将偏移后的数据渲染到minimap画布上
    // 3. 计算出所有节点在一起的边界。
    const { left, top, right, bottom } = MiniMap.__getBounds(data);
    // 4. 计算所有节点的边界与minimap看板的边界的比例.
    const realWidthScale = MiniMap.__width / (right - left);
    const realHeightScale = MiniMap.__height / (bottom - top);
    // 5. 取比例最小的值，将渲染的画布缩小对应比例。
    const innerStyle = MiniMap.__miniMapWrap.firstChild.style;
    const scale = Math.min(realWidthScale, realHeightScale);
    innerStyle.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`;
    innerStyle.transformOrigin = 'left top';
    innerStyle.height = `${bottom - Math.min(top, 0)}px`;
    innerStyle.width = `${right - Math.min(left, 0)}px`;
    MiniMap.__viewPortScale = scale;
    MiniMap.__setViewPort(scale, {
      left,
      top,
      right,
      bottom,
    });
  },
  // 设置视口
  __setViewPort(scale, { left, right }) {
    const viewStyle = MiniMap.__viewport.style;
    viewStyle.width = `${MiniMap.__width - 4}px`;
    viewStyle.height = `${
      (MiniMap.__width - 4) / (MiniMap.__lf.width / MiniMap.__lf.height)
    }px`;
    // top
    const { TRANSLATE_X, TRANSLATE_Y } = MiniMap.__lf.getTransform();

    const realWidth = right - left;
    // 视口实际宽 = 视口默认宽 / (所有元素一起占据的真实宽 / 绘布宽)
    const realViewPortWidth = (MiniMap.__width - 4) / (realWidth / MiniMap.__lf.width);
    // 视口实际高 = 视口实际宽 / (绘布宽 / 绘布高)
    const realViewPortHeight = realViewPortWidth / (MiniMap.__lf.width / MiniMap.__lf.height);

    MiniMap.__viewPortTop = TRANSLATE_Y > 0 ? 0 : -TRANSLATE_Y * scale;
    MiniMap.__viewPortLeft = -TRANSLATE_X * scale;

    MiniMap.__viewPortWidth = realViewPortWidth;
    MiniMap.__viewPortHeight = realViewPortHeight;
    viewStyle.top = `${MiniMap.__viewPortTop}px`;
    viewStyle.left = `${MiniMap.__viewPortLeft}px`;
    viewStyle.width = `${realViewPortWidth}px`;
    viewStyle.height = `${realViewPortHeight}px`;
  },
  // 预览视窗
  __createViewPort() {
    const div = document.createElement('div');
    div.className = 'lf-minimap-viewport';
    div.addEventListener('mousedown', MiniMap.__startDrag);
    MiniMap.__viewport = div;
  },
  __startDrag(e) {
    document.addEventListener('mousemove', MiniMap.__drag);
    document.addEventListener('mouseup', MiniMap.__drop);
    MiniMap.__startPosition = {
      x: e.x,
      y: e.y,
    };
  },
  __drag(e) {
    const viewStyle = MiniMap.__viewport.style;
    MiniMap.__viewPortTop += e.y - MiniMap.__startPosition.y;
    MiniMap.__viewPortLeft += e.x - MiniMap.__startPosition.x;
    viewStyle.top = `${MiniMap.__viewPortTop}px`;
    viewStyle.left = `${MiniMap.__viewPortLeft}px`;
    MiniMap.__startPosition = {
      x: e.x,
      y: e.y,
    };
    const centerX = (MiniMap.__viewPortLeft + MiniMap.__viewPortWidth / 2)
      / MiniMap.__viewPortScale;
    const centerY = (MiniMap.__viewPortTop + MiniMap.__viewPortHeight / 2)
      / MiniMap.__viewPortScale;
    MiniMap.__lf.focusOn({
      coordinate: {
        x: centerX + MiniMap.__resetDataX,
        y: centerY + MiniMap.__resetDataY,
      },
    });
  },
  __drop() {
    document.removeEventListener('mousemove', MiniMap.__drag);
    document.removeEventListener('mouseup', MiniMap.__drop);
  },
};

export default MiniMap;

export { MiniMap };
