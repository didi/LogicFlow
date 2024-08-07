import { LogicFlow } from "@logicflow/core";

type ContentType = {
  type: string;
};

export type ListenerType = {
  data: ContentType;
  e: ContentType;
};

export const createListener = (
  lf: LogicFlow,
  callback: ({ data, e }: ListenerType) => void
): LogicFlow => {
  // node
  lf.on("node:mousedown", ({ data, e }: ListenerType) => callback({ data, e }));
  lf.on("node:mouseup", ({ data, e }: ListenerType) => callback({ data, e }));
  lf.on("node:mousemove", ({ data, e }: ListenerType) => callback({ data, e }));
  lf.on("node:contextmenu", ({ data, e }: ListenerType) =>
    callback({ data, e })
  );
  // edge
  lf.on("edge:click", ({ data, e }: ListenerType) => callback({ data, e }));
  lf.on("edge:dbclick", ({ data, e }: ListenerType) => callback({ data, e }));
  lf.on("edge:contextmenu", ({ data, e }: ListenerType) =>
    callback({ data, e })
  );

  return lf;
};
