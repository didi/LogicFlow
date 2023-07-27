import { v4 as uuidv4 } from 'uuid';

export const createExecId = (): string => {
  const uuid = uuidv4();
  return `exec-${uuid}`;
};

export const createTaskId = (): string => {
  const uuid = uuidv4();
  return `task-${uuid}`;
};
