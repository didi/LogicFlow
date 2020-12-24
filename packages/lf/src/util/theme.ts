import { cloneDeep } from 'lodash-es';
import { defaultTheme } from '../constant/DefaultTheme';

/* 主题（全局样式）相关方法 */
export const updateTheme = (style) => {
  const defaultStyle = cloneDeep(defaultTheme);
  if (style) {
    Object.keys(style).forEach((key) => {
      defaultStyle[key] = { ...defaultStyle[key], ...style[key] };
    });
  }
  return defaultStyle;
};
