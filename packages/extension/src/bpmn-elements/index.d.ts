type DefinitionConfigType = {
  nodes: string[];
  definition: EventDefinitionType[] | TaskDefinitionType[];
};

type DefinitionPropertiesType = {
  definitionType: string;
  timerType?: TimerType;
  timerValue?: string;
  [key: string]: any;
};

type EventDefinitionType = {
  type: string;
  icon: string | Object;
  toJSON: Function;
  properties: DefinitionPropertiesType;
  [key: string]: any;
};

type TaskDefinitionType = {
  type: string;
  [key: string]: any;
};

type TimerType = 'timerCycle' | 'timerDate' | 'timerDuration';
