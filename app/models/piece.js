import DS from 'ember-data';
import { computed } from '@ember/object';
import sanitize from 'sanitize-filename';
import moment from 'moment';

const {
  Model, attr, belongsTo, hasMany,
} = DS;

export default Model.extend({
  name: attr('string'),
  pages: attr('number'),
  words: attr('number'),
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
  // Below relationship only defined in frontend.
  // This definition is merely here to help ember-data with relationship bookkeeping,
  // so that when a piece gets deleted, the submissionActivity-piece relationships get updated.
  submissionActivity: belongsTo('submission-activity'),
  treatment: belongsTo('agenda-item-treatment', {
    inverse: null,
  }),
  newsletter: belongsTo('newsletter-info'),
  meeting: belongsTo('meeting', {
    inverse: null,
  }),
  cases: hasMany('case', {
    inverse: null,
  }),
  submissionActivity: belongsTo('submission-activity', {
    inverse: null,
    serialize: false,
  }),
  // serialize: false ensures the relation (which may contain stale data due to custom service) is not send in patch calls
  agendaitems: hasMany('agendaitem', {
    serialize: false,
    inverse: null,
  }),

  downloadFilename: computed('name', 'file.extension', async function() {
    const filename = `${await this.get('name')}.${await this.get('file.extension')}`;
    return sanitize(filename, { // file-system-safe
      replacement: '_',
    });
  }),

  downloadFileLink: computed('downloadFilename', 'file.downloadLink', async function() {
    return `${await this.get('file.downloadLink')}?name=${encodeURIComponent(await this.get('downloadFilename'))}`; // url-safe
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
