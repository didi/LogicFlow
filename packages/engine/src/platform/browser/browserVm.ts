// import {
//   ErrorCode,
//   getErrorMsg,
//   getWarningMsg,
//   WarningCode,
// } from '../../constant/logCode'
//
// const createContext = (globalData: Record<string, unknown>) => {
//   const iframe = document.createElement('iframe')
//   iframe.style.display = 'none'
//   if (!document || !document.body) {
//     console.error(getErrorMsg(ErrorCode.NO_DOCUMENT_BODY))
//   }
//   document.body.appendChild(iframe)
//   const iframeWindow = iframe.contentWindow
//   if (iframeWindow) {
//     // TODO: 确认是否需要该代码，parent 置为空是为了解决什么问题
//     // @ts-ignore
//     ;(iframeWindow!.parent as any) = null
//     Object.keys(globalData).forEach((key) => {
//       iframeWindow[key] = globalData[key]
//     })
//   }
//   return iframeWindow
// }
//
// const runInContext = (code: string, context: any) => {
//   try {
//     const iframeEval = context.eval
//     iframeEval.call(context, code)
//     console.log('context --->>> ===>>>', context)
//     if (context.frameElement) {
//       document.body.removeChild(context.frameElement)
//     }
//   } catch (e) {
//     console.warn(getWarningMsg(WarningCode.EXPRESSION_EXEC_ERROR), {
//       code,
//       context,
//       e,
//     })
//   }
// }
//
// const runInBrowserContext = async (
//   code: string,
//   globalData = {},
// ): Promise<any> => {
//   const context = createContext(globalData)
//   runInContext(code, context)
//   return context
// }
//
// export { createContext, runInContext, runInBrowserContext }

import Sandbox from '@nyariv/sandboxjs'

export const runInBrowserContext = async (
  code: string,
  globalData = {},
): Promise<any> => {
  try {
    const sandbox = new Sandbox()
    const exec = sandbox.compile(code)
    return await exec(globalData).run()
  } catch (e) {
    console.log('runInBrowserContext error --->>>', e)
  }
}
