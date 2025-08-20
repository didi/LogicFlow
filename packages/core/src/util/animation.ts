import { cloneDeep, merge } from 'lodash-es'
import { CommonTypes } from '../types/common'

export const defaultAnimationOffConfig: CommonTypes.AnimationConfig = {
  node: false,
  edge: false,
}

export const defaultAnimationOnConfig: CommonTypes.AnimationConfig = {
  node: true,
  edge: true,
}

export const setupAnimation = (
  config?: boolean | Partial<CommonTypes.AnimationConfig>,
): CommonTypes.AnimationConfig => {
  if (!config || typeof config === 'boolean') {
    return config === true
      ? cloneDeep(defaultAnimationOnConfig)
      : cloneDeep(defaultAnimationOffConfig)
  }

  // 当传入的是对象时，将其与默认关合并
  const result = merge(cloneDeep(defaultAnimationOffConfig), config)

  // 确保返回的对象包含必需的属性
  return {
    node: result.node ?? false,
    edge: result.edge ?? false,
  }
}

export const updateAnimation = setupAnimation
