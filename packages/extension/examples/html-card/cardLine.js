class CardLine extends BezierEdge {
}

class CardLineModel extends BezierEdgeModel {
  getData() {
    const data = super.getData()
    data.sourceAnchorId = this.sourceAnchorId;
    data.targetAnchorId = this.targetAnchorId;
    return data
  }
}

export default {
  type: 'card-line',
  view: CardLine,
  model: CardLineModel,
}