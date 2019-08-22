import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Model.extend({
	documentVersion: belongsTo('document-version'),
	signature: belongsTo('signature', { inverse: null }),

	filename: attr('string'),
  filenameWithoutExtension: computed('filename', {
    get() {
      const ext = this.get('extension');
      const regex = new RegExp('\\.' + ext + '$');
      return this.get('filename').replace(regex, '');
    },
    set(key, value) {
      const filename = `${value}.${this.get('extension')}`;
      this.set('filename', filename);
      return value;
    }
  }),

	format: attr('string'),
	size: attr('number'),
	extension: attr('string'),
	created: attr('date'),
	contentType: attr('string'),
	name: alias('filename') // Compatibility. Use of 'name' should be refactored out.
});
