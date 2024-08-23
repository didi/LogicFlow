import { get } from 'lodash-es'

export const isIe = () =>
  get(window, 'navigator.userAgent', '').match(/MSIE|Trident/) !== null
