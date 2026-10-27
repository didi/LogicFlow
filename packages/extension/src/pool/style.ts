export const POOL_STYLE_ID = 'logicflow-pool-elements-style'

export const poolStyleContent = `
.lf-lane-reordering .lf-node-content > g {
  transition: transform 160ms ease-out;
}
.lf-pool-lane-drop-indicator {
  stroke: #feb663;
  stroke-width: 2;
  stroke-dasharray: 4 4;
  pointer-events: none;
}
.lf-pool-lane-drag-not-allowed,
.lf-pool-lane-drag-not-allowed * {
  cursor: not-allowed !important;
}
.lf-pool-lane-drag-allowed,
.lf-pool-lane-drag-allowed * {
  cursor: copy !important;
}
`
