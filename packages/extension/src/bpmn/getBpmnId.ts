import Ids from 'ids';

const ids = new Ids([32, 32, 1]);

export function getBpmnId(): string {
  return ids.next();
}
