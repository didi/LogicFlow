import { runInNewContext } from './nodeVm';
import { runInBrowserContext } from './browserVm';
import { isInNodeJS, isInBrowser, globalScope } from '../util/global';

const getExpressionResult = async (code: string, context: any) => {
  if (isInNodeJS) {
    const r = await runInNewContext(code, context);
    return r;
  }
  if (isInBrowser) {
    const r = await runInBrowserContext(code, context);
    return r;
  }
  return globalScope.eval(code); // eslint-disable-line no-eval
};

export {
  getExpressionResult,
};
