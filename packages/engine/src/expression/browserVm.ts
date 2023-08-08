import {
  ErrorCode,
  WarningCode,
  getErrorMsg,
  getWarningMsg,
} from '../constant/LogCode';

const runInBrowserContext = async (code: string, globalData: any = {}) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  if (!document || !document.body) {
    console.error(getErrorMsg(ErrorCode.NO_DOCUMENT_BODY));
  }
  let res = null;
  try {
    document.body.appendChild(iframe);
    const iframeWindow = iframe.contentWindow as any;
    iframeWindow.parent = null;
    const iframeEval = iframeWindow.eval;
    Object.keys(globalData).forEach((key) => {
      iframeWindow[key] = globalData[key];
    });
    iframeEval.call(iframeWindow, code);
    res = iframeWindow;
  } catch (e) {
    console.warn(getWarningMsg(WarningCode.EXPRESSION_EXEC_ERROR), { code, globalData, e });
  }
  document.body.removeChild(iframe);
  return res;
};

export {
  runInBrowserContext,
};
