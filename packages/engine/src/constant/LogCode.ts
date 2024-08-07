export enum ErrorCode {
  // 模型数据错误
  NONE_START_NODE = 1000,
  NONE_NODE_ID = 1001,

  // 表达式错误
  NO_DOCUMENT_BODY = 2001,
}

export enum WarningCode {
  NONE_START_NODE_IN_DATA = 2000,
  START_NODE_INCOMING = 2001,

  // 表达式判断异常
  EXPRESSION_EXEC_ERROR = 3000,
}

// TODO: 感觉这块可以用个国际化插件，这样配置不同语言加文件就可以了。
const errorMsgMapCn = {
  [ErrorCode.NONE_START_NODE]: '未找到入度为0的节点',
  [ErrorCode.NONE_NODE_ID]: '流程数据中存在没有此节点',
  [ErrorCode.NO_DOCUMENT_BODY]: '找不到document.body, 请在DOM加载完成后再执行',
}

const warningMsgMapCn = {
  [WarningCode.NONE_START_NODE_IN_DATA]: '初始化数据中未找到入度为0的节点',
  [WarningCode.START_NODE_INCOMING]: '开始节点不允许被连入',
  [WarningCode.EXPRESSION_EXEC_ERROR]: '表达式执行异常',
}

export const getErrorMsg = (code: ErrorCode) =>
  `error[${code}]: ${errorMsgMapCn[code]}`
export const getWarningMsg = (code: WarningCode) =>
  `warning[${code}]: ${warningMsgMapCn[code]}`
