export const elkOptionMap = {
  rankdir: {
    LR: 'RIGHT',
    TB: 'DOWN',
    BT: 'UP',
    RL: 'LEFT',
    default: 'RIGHT',
  },
  align: {
    UL: 'RIGHTDOWN',
    UR: 'RIGHTUP',
    DL: 'LEFTDOWN',
    DR: 'LEFTUP',
    default: 'BALANCED',
  },
  ranker: {
    'network-simplex': 'NETWORK_SIMPLEX',
    'tight-tree': 'NETWORK_SIMPLEX',
    'longest-path': 'LONGEST_PATH',
    default: 'NETWORK_SIMPLEX',
  },
  acyclicer: {
    greedy: 'GREEDY',
    default: 'DEPTH_FIRST',
  },
}
