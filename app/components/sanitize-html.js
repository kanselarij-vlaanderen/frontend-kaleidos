import Component from '@glimmer/component';
import sanitizeHtml from 'sanitize-html';
import { isPresent } from '@ember/utils';

const additionalAllowedTags = ['del'];

export default class SanitizeHtmlComponent extends Component {
  constructor() {
    super(...arguments);
    this.sanitizedValue;
  }

  get sanitizedValue() {
    const options = this.args.options || {};
    options.allowedTags = isPresent(options.allowedTags) ? options.allowedTags : sanitizeHtml.defaults.allowedTags.concat(additionalAllowedTags); // add more tags to the default allowed tags
    const value = Array.isArray(this.args.value) ? this.args.value.join(' - ') : this.args.value || '';
    return sanitizeHtml(value, options) || '';
  }
}
