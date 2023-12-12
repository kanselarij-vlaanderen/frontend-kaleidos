import Component from '@glimmer/component';
import sanitizeHtml from 'sanitize-html';
import merge from 'lodash/merge';
import { isPresent } from '@ember/utils';

const additionalAllowedTags = ['del'];
const additionalAllowedAttributes = {
  'ol': ['data-list-style'],
  'table': [
    {
      name: 'id',
      values: ['attendees', 'absentees'],
    },
  ],
};

export default class SanitizeHtmlComponent extends Component {
  constructor() {
    super(...arguments);
    this.sanitizedValue;
  }

  get sanitizedValue() {
    const options = this.args.options || {};
    options.allowedTags = isPresent(options.allowedTags) ? options.allowedTags : sanitizeHtml.defaults.allowedTags.concat(additionalAllowedTags); // add more tags to the default allowed tags
    options.allowedAttributes = isPresent(options.allowedAttributes) ? options.allowedAttributes : merge(sanitizeHtml.defaults.allowedAttributes, additionalAllowedAttributes); // add more attributes to the default allowed attributes
    const value = Array.isArray(this.args.value) ? this.args.value.join(' - ') : this.args.value || '';
    return sanitizeHtml(value, options) || '';
  }
}
