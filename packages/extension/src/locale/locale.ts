export class Locale {
  constructor(LogicFlow?: any, map?: Object) {
    if (LogicFlow && map) {
      this.replaceTranslator(LogicFlow, map);
    }
  }

  replaceTranslator(LogicFlow: any, map: Object) {
    LogicFlow.t = (text: string) => (map[text] ? map[text] : text);
  }

  setDefault(LogicFlow: any) {
    LogicFlow.t = Locale.defaultTranslator;
  }

  static defaultTranslator = (text: string) => text;
}
