import LogicFlow, { CircleNode, CircleNodeModel, Model } from '@logicflow/core'
import { find, findIndex, isEqual, isEmpty } from 'lodash-es'

class freeAnchorCircleNodeModel extends CircleNodeModel {
  allowCreateNewPoint: boolean = true
  curAnchorId: string = ''
  constructor(data: any, graphModel: any) {
    super(data, graphModel)
  }
  initNodeData(data: LogicFlow.NodeConfig<LogicFlow.PropertiesType>): void {
    super.initNodeData(data)
    this.registerEvent()
    this.setIsShowAnchor(true)
  }
  registerEvent() {
    // 鼠标移入时，实时创建锚点
    this.graphModel.eventCenter.on(
      'node:mouseenter,node:mouseleave,node:mousemove',
      ({ data, e: event }) => {
        if (data.type !== this.type || data.id !== this.id) return
        if (!event || !this.allowCreateNewPoint) return
        const { clientX, clientY } = event

        const {
          canvasOverlayPosition: { x, y },
        } = this.graphModel.getPointByClient({
          x: clientX,
          y: clientY,
        })

        const { x: translateX, y: translateY } =
          this.getProjectionPointOnCircle(x, y, this.x, this.y, this.r)
        console.log(
          'data',
          data,
          [clientX, clientY],
          this.graphModel.transformModel.CanvasPointToHtmlPoint([
            this.x,
            this.y,
          ]),
          [this.x, this.y],
          [x, y],
          [translateX, translateY],
        )
        const anchorId = `${this.id}_${x}_${y}`
        this.anchorsOffset.push({
          id: anchorId,
          x: translateX - this.x,
          y: translateY - this.y,
        })
        this.curAnchorId = anchorId
      },
    )
    // 鼠标移动实时更新锚点坐标
    // this.graphModel.eventCenter.on("node:mousemove", ({ data, e: event }) => {
    //   if (data.type !== this.type || data.id !== this.id) return;
    //   console.log("this.anchorsOffset", this.anchorsOffset);
    //   if (!event) return;
    //   const { clientX, clientY } = event;
    //   const {
    //     canvasOverlayPosition: { x, y },
    //   } = this.graphModel.getPointByClient({
    //     x: clientX,
    //     y: clientY,
    //   });
    //   // this.removeUnusedAnchors();
    //   if (this.curAnchorId) {
    //     const curAnchorIndex = findIndex(
    //       this.anchorsOffset,
    //       (anchor: any) => anchor.id === this.curAnchorId
    //     );
    //     if (curAnchorIndex >= 0) {
    //       this.anchorsOffset.splice(curAnchorIndex, 1, {
    //         ...this.anchorsOffset[curAnchorIndex],
    //         x,
    //         y,
    //       });
    //     }
    //   }
    // });
    this.graphModel.eventCenter.on('anchor:dragstart', ({ data }) => {
      const { id } = data
      const curAnchorIndex = findIndex(
        this.anchorsOffset,
        (anchor: any) => anchor.id === id,
      )
      if (curAnchorIndex >= 0) {
        this.allowCreateNewPoint = false
      }
    })
    this.graphModel.eventCenter.on('anchor:dragend', ({ data }) => {
      const { id } = data
      const curAnchorIndex = findIndex(
        this.anchorsOffset,
        (anchor: any) => anchor.id === id,
      )
      if (curAnchorIndex >= 0) {
        this.allowCreateNewPoint = true
      }
    })
    // this.graphModel.eventCenter.on("node:mouseleave", ({ data }) => {
    //   if (data.type !== this.type || data.id !== this.id || !this.allowCreateNewPoint) return;
    //   this.removeUnusedAnchors();
    // });
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    return []
  }
  getTargetAnchor(position: LogicFlow.Point) {
    const curAnchor = find(this.anchors, (anchor: Model.AnchorConfig) => {
      return isEqual([anchor.x, anchor.y], [position.x, position.y])
    })
    // super.getTargetAnchor会返回距离position最近的锚点信息，如果curAnchor有值的话，super.getTargetAnchor返回的就是同坐标的锚点
    // 所以这里直接return了super.getTargetAnchor
    if (!curAnchor && this.allowCreateNewPoint) {
      this.removeUnusedAnchors()
      const { x: translateX, y: translateY } = this.getProjectionPointOnCircle(
        position.x,
        position.y,
        this.x,
        this.y,
        this.r,
      )
      this.anchorsOffset.push({
        id: `${this.id}_${position.x}_${position.y}`,
        x: translateX - this.x,
        y: translateY - this.y,
      })
    }
    return super.getTargetAnchor(position)
  }
  removeUnusedAnchors() {
    const { edges: incomingEdges } = this.incoming
    const { edges: outgoingEdges } = this.outgoing
    const onUsedAnchors: any[] = []
    if (!isEmpty(incomingEdges)) {
      incomingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.targetAnchorId)
      })
    }
    if (!isEmpty(incomingEdges)) {
      outgoingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.sourceAnchorId)
      })
    }
    console.log('outgoingEdges', outgoingEdges)
    this.anchorsOffset = this.anchorsOffset.filter((anchor: any) =>
      onUsedAnchors.includes(anchor.id),
    )
  }
  // 获取点距矩形最近的边框的投影点坐标
  getProjectionPointOnCircle(
    px: number,
    py: number,
    cx: number,
    cy: number,
    r: number,
  ) {
    // 计算点 (px, py) 到圆心 (cx, cy) 的向量
    const dx = px - cx
    const dy = py - cy

    // 计算该向量的长度
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 如果距离为0，说明点已经在圆心了，此时返回圆心坐标
    if (distance === 0) {
      return { x: cx, y: cy }
    }

    // 缩放比例，调整点的位置到圆上的投影点
    const scale = r / distance

    // 计算投影点的坐标
    const px_proj = cx + dx * scale
    const py_proj = cy + dy * scale

    return { x: px_proj, y: py_proj }
  }

  // getAnchorStyle() {
  //   return {
  //     fill: "transparent",
  //     stroke: "transparent",
  //   };
  // }
}

export default {
  type: 'freeAnchorCircle',
  model: freeAnchorCircleNodeModel,
  view: CircleNode,
}
