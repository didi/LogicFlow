import {
  ErrorCode,
  WarningCode,
  getErrorMsg,
  getWarningMsg,
} from '../constant/LogCode';

const createContext = (globalData) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  if (!document || !document.body) {
    console.error(getErrorMsg(ErrorCode.NO_DOCUMENT_BODY));
  }
  document.body.appendChild(iframe);
  const iframeWindow = iframe.contentWindow as any;
  iframeWindow.parent = null;
  Object.keys(globalData).forEach((key) => {
    iframeWindow[key] = globalData[key];
  });
  return iframeWindow;
};
const runInContext = (code, context) => {
  try {
    const iframeEval = context.eval;
    iframeEval.call(context, code);
    if (context.frameElement) {
      document.body.removeChild(context.frameElement);
    }
  } catch (e) {
    console.warn(getWarningMsg(WarningCode.EXPRESSION_EXEC_ERROR), { code, context, e });
  }
  return context;
};
const runInBrowserContext = async (code: string, globalData: any = {}) => {
  const context = createContext(globalData);
  runInContext(code, context);
  return context;
};
export {
  runInBrowserContext,
  createContext,
  runInContext,
};
