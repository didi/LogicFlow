import { cloneDeep, merge } from 'lodash-es';
import { defaultTheme, Theme } from '../constant/DefaultTheme';

/* 主题（全局样式）相关方法 */
export const updateTheme = (style: Theme) => {
  let defaultStyle = cloneDeep(defaultTheme);
  if (style) {
    /**
     * 为了不让默认样式被覆盖，改用merge
     * 例如：锚点主题hover
     * 用户传入
     * lf.setTheme({
     *   anchor: {
     *     hover: {
     *       fill: 'red'
     *     }
     *   }
     * })
     */
    defaultStyle = merge(defaultStyle, style);
    // Object.keys(style).forEach((key) => {
    //   defaultStyle[key] = { ...defaultStyle[key], ...style[key] };
    // });
  }
  return defaultStyle;
};
