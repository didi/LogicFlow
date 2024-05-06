import vm from 'node:vm'
// const vm = require('node:vm');

export const runInNodeContext = async (
  code: string,
  globalData: Record<string, unknown> = {},
): Promise<any> => {
  const context = vm.createContext(globalData)
  vm.runInContext(code, context)

  console.log('context ===>>>', context)

  return context
}
