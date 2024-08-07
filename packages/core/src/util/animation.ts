import { cloneDeep, merge } from 'lodash-es'
import { Options } from '../options'

import AnimationConfig = Options.AnimationConfig

export const defaultAnimationOffConfig = {
  node: false,
  edge: false,
}

export const defaultAnimationOnConfig = {
  node: true,
  edge: true,
}

export const setupAnimation = (
  config?: boolean | Partial<AnimationConfig>,
): AnimationConfig => {
  if (!config || typeof config === 'boolean') {
    return config === true
      ? cloneDeep(defaultAnimationOnConfig)
      : cloneDeep(defaultAnimationOffConfig)
  }

  // 当传入的是对象时，将其与默认关合并
  return merge(cloneDeep(defaultAnimationOffConfig), config)
}

export const updateAnimation = setupAnimation
