import { v4 as uuidV4 } from 'uuid'

export const createExecId = (): string => {
  const uuid = uuidV4()
  return `exec-${uuid}`
}

export const createActionId = (): string => {
  const uuid = uuidV4()
  return `action-${uuid}`
}

export const createEngineId = (): string => {
  const uuid = uuidV4()
  return `engine-${uuid}`
}
