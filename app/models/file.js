import DS from 'ember-data';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import sanitize from 'sanitize-filename';

const {
  Model, attr, belongsTo,
} = DS;

export default Model.extend({
  piece: belongsTo('piece'),
  signature: belongsTo('signature', {
    inverse: null,
  }),

  filename: attr('string'),
  filenameWithoutExtension: computed('filename', {
    get() {
      const ext = this.get('extension');
      // eslint-disable-next-line no-useless-escape
      const regex = new RegExp(`\.${ext}$`);
      return this.get('filename').replace(regex, '');
    },
    // eslint-disable-next-line no-unused-vars
    set(key, value) {
      const filename = `${value}.${this.get('extension')}`;
      this.set('filename', filename);
      return value;
    },
  }),

  format: attr('string'),
  size: attr('number'),
  extension: attr('string'),
  created: attr('datetime'),
  contentType: attr('string'),

  downloadFilename: computed('filename', function() {
    return sanitize(this.get('filename'), { // file-system-safe
      replacement: '_',
    });
  }),
  downloadLink: computed('id', function() {
    return `/files/${this.get('id')}/download`;
  }),
  namedDownloadLink: computed('downloadFilename', 'downloadLink', function() {
    return `${this.downloadLink}?name=${encodeURIComponent(this.downloadFilename)}`; // url-safe
  }),
  name: alias('filename'), // Compatibility. Use of 'name' should be refactored out.
});
