import Component from '@glimmer/component';
import sanitizeHtml from 'sanitize-html';
import assign from 'lodash/merge';
import { isPresent } from '@ember/utils';

const additionalAllowedTags = ['del'];
const additionalAllowedAttributes = {
  '*': ['data-indentation-level'],
  'ol': ['data-list-style'],
  'table': [
    {
      name: 'id',
      values: ['attendees', 'absentees'],
    },
  ],
  'section': [
    {
      name: 'data-section',
      values: ['agendaitems', 'announcements'],
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
    options.allowedAttributes = isPresent(options.allowedAttributes) ? options.allowedAttributes : assign(sanitizeHtml.defaults.allowedAttributes, additionalAllowedAttributes); // add more attributes to the default allowed attributes
    const value = Array.isArray(this.args.value) ? this.args.value.join(' - ') : this.args.value || '';
    return sanitizeHtml(value, options) || '';
  }
}
