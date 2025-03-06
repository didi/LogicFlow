import React, { useEffect, useRef } from 'react';
import { find, findIndex, isEqual, isEmpty } from 'lodash-es';

import '@logicflow/core/es/index.css';

const registerEvent = (model: any) => {
  // 鼠标移入时，实时创建锚点
  model.graphModel.eventCenter.on('node:mouseenter', ({ data, e: event }) => {
    if (data.type !== model.type || data.id !== model.id) return;
    if (!event || !model.allowCreateNewPoint) return;
    const { clientX, clientY } = event;

    const {
      canvasOverlayPosition: { x, y },
    } = model.graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    });

    const { x: translateX, y: translateY } = model.getProjectionPointFromCenter(
      x,
      y,
      model.x,
      model.y,
      model.width,
      model.height,
    );
    console.log(
      'data',
      data,
      [clientX, clientY],
      model.graphModel.transformModel.CanvasPointToHtmlPoint([
        model.x,
        model.y,
      ]),
      [model.x, model.y],
      [x, y],
      [translateX, translateY],
    );
    const anchorId = `${model.id}_${x}_${y}`;
    model.anchorsOffset.push({
      id: anchorId,
      x: translateX - model.x,
      y: translateY - model.y,
    });
    model.curAnchorId = anchorId;
  });
  // 鼠标移动实时更新锚点坐标
  model.graphModel.eventCenter.on('node:mousemove', ({ e: event }) => {
    if (data.type !== model.type || data.id !== model.id) return;
    console.log('model.anchorsOffset', model.anchorsOffset);
    if (!event) return;
    const { clientX, clientY } = event;
    const {
      canvasOverlayPosition: { x, y },
    } = model.graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    });
    // model.removeUnusedAnchors();
    if (model.curAnchorId) {
      const curAnchorIndex = findIndex(
        model.anchorsOffset,
        (anchor: any) => anchor.id === model.curAnchorId,
      );
      if (curAnchorIndex >= 0) {
        model.anchorsOffset.splice(curAnchorIndex, 1, {
          ...model.anchorsOffset[curAnchorIndex],
          x,
          y,
        });
      }
    }
  });
  model.graphModel.eventCenter.on('anchor:dragstart', ({ data }) => {
    const { id } = data;
    const curAnchorIndex = findIndex(
      model.anchorsOffset,
      (anchor: any) => anchor.id === id,
    );
    if (curAnchorIndex >= 0) {
      model.allowCreateNewPoint = false;
    }
  });
  model.graphModel.eventCenter.on('anchor:dragend', ({ data }) => {
    const { id } = data;
    const curAnchorIndex = findIndex(
      model.anchorsOffset,
      (anchor: any) => anchor.id === id,
    );
    if (curAnchorIndex >= 0) {
      model.allowCreateNewPoint = true;
    }
  });
  model.graphModel.eventCenter.on('node:mouseleave', ({ data }) => {
    if (
      data.type !== model.type ||
      data.id !== model.id ||
      !model.allowCreateNewPoint
    )
      return;
    model.removeUnusedAnchors();
  });
};

class freeAnchorRectNodeModel extends RectNodeModel {
  isShowAnchor: boolean = true;
  allowCreateNewPoint: boolean = true;
  curAnchorId: string = '';
  constructor(data: any, graphModel: any) {
    super(data, graphModel);
  }
  initNodeData(data: LogicFlow.NodeConfig<LogicFlow.PropertiesType>): void {
    super.initNodeData(data);
    registerEvent(this);
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    return [];
  }
  getTargetAnchor(position: LogicFlow.Point) {
    const curAnchor = find(this.anchors, (anchor: Model.AnchorConfig) => {
      return isEqual([anchor.x, anchor.y], [position.x, position.y]);
    });
    // super.getTargetAnchor会返回距离position最近的锚点信息，如果curAnchor有值的话，super.getTargetAnchor返回的就是同坐标的锚点
    // 所以这里直接return了super.getTargetAnchor
    if (!curAnchor && this.allowCreateNewPoint) {
      this.removeUnusedAnchors();
      const { x: translateX, y: translateY } =
        this.getProjectionPointFromCenter(
          position.x,
          position.y,
          this.x,
          this.y,
          this.width,
          this.height,
        );
      this.anchorsOffset.push({
        id: `${this.id}_${position.x}_${position.y}`,
        x: translateX - this.x,
        y: translateY - this.y,
      });
    }
    return super.getTargetAnchor(position);
  }
  removeUnusedAnchors() {
    const { edges: incomingEdges } = this.incoming;
    const { edges: outgoingEdges } = this.outgoing;
    const onUsedAnchors: any[] = [];
    if (!isEmpty(incomingEdges)) {
      incomingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.targetAnchorId);
      });
    }
    if (!isEmpty(incomingEdges)) {
      outgoingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.sourceAnchorId);
      });
    }
    console.log('outgoingEdges', outgoingEdges);
    this.anchorsOffset = this.anchorsOffset.filter((anchor: any) =>
      onUsedAnchors.includes(anchor.id),
    );
  }
  // 获取点距矩形最近的边框的投影点坐标
  getProjectionPointFromCenter(
    px: number,
    py: number,
    cx: number,
    cy: number,
    width: number,
    height: number,
  ) {
    // 计算矩形的四个边界
    const left = cx - width / 2;
    const right = cx + width / 2;
    const top = cy - height / 2;
    const bottom = cy + height / 2;

    // 计算点到矩形四条边的投影点
    // 左边界的投影
    const projectionLeftX = left;
    const projectionLeftY = Math.max(top, Math.min(py, bottom));

    // 右边界的投影
    const projectionRightX = right;
    const projectionRightY = Math.max(top, Math.min(py, bottom));

    // 上边界的投影
    const projectionTopX = Math.max(left, Math.min(px, right));
    const projectionTopY = top;

    // 下边界的投影
    const projectionBottomX = Math.max(left, Math.min(px, right));
    const projectionBottomY = bottom;

    // 计算与点的距离，并选择最近的投影点
    const distance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    // 计算每个投影点与点的距离
    const distanceLeft = distance(px, py, projectionLeftX, projectionLeftY);
    const distanceRight = distance(px, py, projectionRightX, projectionRightY);
    const distanceTop = distance(px, py, projectionTopX, projectionTopY);
    const distanceBottom = distance(
      px,
      py,
      projectionBottomX,
      projectionBottomY,
    );

    // 找到最短的距离并返回对应的投影点
    let minDistance = distanceLeft;
    let projectionPoint = { x: projectionLeftX, y: projectionLeftY };

    if (distanceRight < minDistance) {
      minDistance = distanceRight;
      projectionPoint = { x: projectionRightX, y: projectionRightY };
    }

    if (distanceTop < minDistance) {
      minDistance = distanceTop;
      projectionPoint = { x: projectionTopX, y: projectionTopY };
    }

    if (distanceBottom < minDistance) {
      minDistance = distanceBottom;
      projectionPoint = { x: projectionBottomX, y: projectionBottomY };
    }

    return projectionPoint;
  }
  getAnchorStyle() {
    return {
      fill: 'transparent',
      stroke: 'transparent',
    };
  }
}

const freeAnchorRect = {
  type: 'freeAnchorRect',
  model: freeAnchorRectNodeModel,
  view: RectNode,
};

class freeAnchorCircleNodeModel extends CircleNodeModel {
  isShowAnchor: boolean = true;
  allowCreateNewPoint: boolean = true;
  curAnchorId: string = '';
  constructor(data: any, graphModel: any) {
    super(data, graphModel);
  }
  initNodeData(data: LogicFlow.NodeConfig<LogicFlow.PropertiesType>): void {
    super.initNodeData(data);
    registerEvent(this);
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    return [];
  }
  getTargetAnchor(position: LogicFlow.Point) {
    const curAnchor = find(this.anchors, (anchor: Model.AnchorConfig) => {
      return isEqual([anchor.x, anchor.y], [position.x, position.y]);
    });
    // super.getTargetAnchor会返回距离position最近的锚点信息，如果curAnchor有值的话，super.getTargetAnchor返回的就是同坐标的锚点
    // 所以这里直接return了super.getTargetAnchor
    if (!curAnchor && this.allowCreateNewPoint) {
      this.removeUnusedAnchors();
      const { x: translateX, y: translateY } = this.getProjectionPointOnCircle(
        position.x,
        position.y,
        this.x,
        this.y,
        this.r,
      );
      this.anchorsOffset.push({
        id: `${this.id}_${position.x}_${position.y}`,
        x: translateX - this.x,
        y: translateY - this.y,
      });
    }
    return super.getTargetAnchor(position);
  }
  removeUnusedAnchors() {
    const { edges: incomingEdges } = this.incoming;
    const { edges: outgoingEdges } = this.outgoing;
    const onUsedAnchors: any[] = [];
    if (!isEmpty(incomingEdges)) {
      incomingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.targetAnchorId);
      });
    }
    if (!isEmpty(incomingEdges)) {
      outgoingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.sourceAnchorId);
      });
    }
    console.log('outgoingEdges', outgoingEdges);
    this.anchorsOffset = this.anchorsOffset.filter((anchor: any) =>
      onUsedAnchors.includes(anchor.id),
    );
  }
  // 获取点距圆形最近的边框的投影点坐标
  getProjectionPointOnCircle(px, py, cx, cy, r) {
    // 计算点 (px, py) 到圆心 (cx, cy) 的向量
    const dx = px - cx;
    const dy = py - cy;

    // 计算该向量的长度
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果距离为0，说明点已经在圆心了，此时返回圆心坐标
    if (distance === 0) {
      return { x: cx, y: cy };
    }

    // 缩放比例，调整点的位置到圆上的投影点
    const scale = r / distance;

    // 计算投影点的坐标
    const px_proj = cx + dx * scale;
    const py_proj = cy + dy * scale;

    return { x: px_proj, y: py_proj };
  }
  getAnchorStyle() {
    return {
      fill: 'transparent',
      stroke: 'transparent',
    };
  }
}

const freeAnchorCircle = {
  type: 'freeAnchorCircle',
  model: freeAnchorCircleNodeModel,
  view: CircleNode,
};

const container = document.querySelector('#container');
const root = createRoot(container);
const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const data = {
  nodes: [
    {
      id: 'node-1',
      type: 'freeAnchorRect',
      x: 80,
      y: 220,
      properties: {
        width: 50,
        height: 50,
        radius: 5,
      },
    },
    {
      id: 'node-2',
      type: 'freeAnchorCircle',
      x: 180,
      y: 220,
      properties: {
        r: 50,
        radius: 5,
      },
    },
  ],
  edges: [],
};

const App: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10,
        },
      });

      lf.register(freeAnchorRect);
      lf.register(freeAnchorCircle);

      lf.render(data);
      lf.on('custom:button-click', (model: any) => {
        lf.setProperties(model.id, {
          body: 'LogicFlow',
        });
      });
      lf.translateCenter();
      lfRef.current = lf;
    }
  }, []);

  return <div ref={containerRef} id="graph"></div>;
};

root.render(<App></App>);

insertCss(`
#graph{
  width: 100%;
  height: 100%;
}

.uml-wrapper {
  background: #efdbff;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px solid #9254de;
  box-sizing: border-box;
}

.uml-btn {
  width: 32px;
  min-width: 32px;
  color: #fff;
  background-color: #9254de;
  border: 1px solid #1a223f;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.uml-btn:hover {
  color: #fff;
  background-color: #a780d7;
}

.uml-head {
  text-align: center;
  line-height: 30px;
  font-size: 16px;
  font-weight: bold;
}

.uml-body {
  border-top: 1px solid #9254de;
  border-bottom: 1px solid #9254de;
  padding: 5px 10px;
  font-size: 12px;
}

.uml-footer {
  padding: 5px 10px;
  font-size: 14px;
}

`);
