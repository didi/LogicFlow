import { Locale } from '../locale';
import en from './en';

class EnLocale extends Locale {
  static pluginName = 'enLocale';
  constructor({ LogicFlow }) {
    super(LogicFlow, en);
  }
}

export default EnLocale;

export { EnLocale };
