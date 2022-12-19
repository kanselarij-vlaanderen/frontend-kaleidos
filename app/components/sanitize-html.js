import Component from '@glimmer/component';
import sanitizeHtml from 'sanitize-html';

export default class SanitizeHtmlComponent extends Component {
  constructor() {
    super(...arguments);
    this.sanitizedValue;
  }

  get sanitizedValue() {
    const options = this.args.options;
    const value = this.args.value || '';
    return sanitizeHtml(value, options) || '';
  }
}