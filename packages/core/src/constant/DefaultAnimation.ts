export type AnimationConfig = {
  edge: boolean;
  node: boolean;
};

export type Animation = {
  stroke: string;
  strokeDasharray: string;
  className: string;
};

// 不填或者false返回的配置，表示不开启所有动画
export const defaultAnimationCloseConfig: AnimationConfig = {
  node: false,
  edge: false,
};

// 仅使用true的时候返回的配置，表示开启所有动画
export const defaultAnimationOpenConfig: AnimationConfig = {
  node: true,
  edge: true,
};

export const defaultAnimationData: Animation = {
  stroke: 'red',
  strokeDasharray: '40 200',
  className: 'lf-edge-animation',
};
