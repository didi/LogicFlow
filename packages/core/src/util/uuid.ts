import { v4 as uuidv4 } from 'uuid';

export const createUuid = (): string => {
  const uuid = uuidv4();
  return uuid;
};
