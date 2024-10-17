import Component from '@glimmer/component';
import sanitizeHtml from 'sanitize-html';
import assign from 'lodash/merge';
import { isPresent } from '@ember/utils';

const additionalAllowedTags = ['del'];
const additionalAllowedAttributes = {
  '*': ['data-indentation-level'],
  'ol': ['style', 'data-hierarchical', 'data-list-style'],
  'li': ['data-list-marker'],
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
const additionalAllowedStyles = {
  'ol': {
    'list-style-type': [/.*/]
  }
}

export default class SanitizeHtmlComponent extends Component {
  constructor() {
    super(...arguments);
    this.sanitizedValue;
  }

  get sanitizedValue() {
    const options = this.args.options || {};
    options.allowedTags = isPresent(options.allowedTags) ? options.allowedTags : sanitizeHtml.defaults.allowedTags.concat(additionalAllowedTags); // add more tags to the default allowed tags
    options.allowedAttributes = isPresent(options.allowedAttributes) ? options.allowedAttributes : assign(sanitizeHtml.defaults.allowedAttributes, additionalAllowedAttributes); // add more attributes to the default allowed attributes
    options.allowedStyles = isPresent(options.allowedStyles) ? options.allowedStyles : assign(sanitizeHtml.defaults.allowedStyles, additionalAllowedStyles); // add more styles to the default allowed styles
    const value = Array.isArray(this.args.value) ? this.args.value.join(' - ') : this.args.value || '';
    return sanitizeHtml(value, options) || '';
  }
}
