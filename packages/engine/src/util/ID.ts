import { v4 as uuidv4 } from 'uuid';

export const createExecId = (): string => {
  const uuid = uuidv4();
  return `exec-${uuid}`;
};

export const createActionId = (): string => {
  const uuid = uuidv4();
  return `action-${uuid}`;
};

export const createEngineId = (): string => {
  const uuid = uuidv4();
  return `engine-${uuid}`;
};
