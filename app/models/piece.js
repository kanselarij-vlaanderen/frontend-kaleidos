import DS from 'ember-data';
import { computed } from '@ember/object';
import sanitize from 'sanitize-filename';
import moment from 'moment';

const {
  Model, attr, belongsTo,
} = DS;

export default Model.extend({
  name: attr('string'),
  created: attr('datetime'),
  modified: attr('datetime'),
  confidential: attr('boolean'),
  accessLevelLastModified: attr('datetime'),
  accessLevel: belongsTo('access-level'),

  file: belongsTo('file'),
  convertedFile: belongsTo('file', {
    inverse: null,
  }),

  documentContainer: belongsTo('document-container', {
    inverse: null,
  }),
  nextPiece: belongsTo('piece', {
    inverse: 'previousPiece',
  }),
  previousPiece: belongsTo('piece', {
    inverse: 'nextPiece',
  }),

  subcase: belongsTo('subcase', {
    inverse: null,
  }),
  agendaitem: belongsTo('agendaitem', {
    inverse: null,
  }),
  treatment: belongsTo('agenda-item-treatment', {
    inverse: null,
  }),
  newsletter: belongsTo('newsletter-info'),
  meeting: belongsTo('meeting', {
    inverse: null,
  }),

  downloadFilename: computed('name', 'file.extension', async function() {
    const filename = `${await this.get('name')}.${await this.get('file.extension')}`;
    return sanitize(filename, {
      replacement: '_',
    });
  }),

  changeAccessLevelLastModified() {
    if (!this.get('confidential')) {
      this.set('accessLevelLastModified', moment().utc()
        .toDate());
    }
  },

  save() {
    const parentSave = this._super;
    const dirtyType = this.get('dirtyType');
    switch (dirtyType) {
      case 'deleted':
        break;
      default:
        this.set('modified', moment().utc()
          .toDate());
        this.changeAccessLevelLastModified();
        break;
    }

    return parentSave.call(this, ...arguments);
  },

});
