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
  language: belongsTo('language'),

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

  // resources with pieces linked:

  // Below relationship is only defined in frontend.
  // This definition is merely here to help ember-data with relationship bookkeeping,
  // so that when a piece gets deleted, the submissionActivity-piece relationships get updated.
  // The submission activity should never be sent to the backend from the piece-side
  // as long as the relationship is not defined in the backend.
  submissionActivity: belongsTo('submission-activity', {
    serialize: false,
  }),
  treatment: belongsTo('agenda-item-treatment', {
    inverse: null,
  }),
  newsletter: belongsTo('newsletter-info'),
  meeting: belongsTo('meeting', {
    inverse: null,
  }),
  publicationFlow: belongsTo('publication-flow'),
  translationSubcase: belongsTo('translation-subcase'),
  publicationSubcaseAsSource: belongsTo('publication-subcase'),
  proofingActivityAsGenerated: belongsTo('proofing-activity'),
  publicationActivityAsGenerated: belongsTo('publication-activity'),

  cases: hasMany('case', {
    inverse: null, // TODO: figure out if and why this is required. Delete otherwise.
  }),
  // serialize: false ensures the relation (which may contain stale data due to custom service) is not send in patch calls
  agendaitems: hasMany('agendaitem', {
    serialize: false,
    inverse: null,
  }),

  viewDocumentURL: computed('id', function() {
    return `/document/${this.id}`;
  }),

  downloadFilename: computed('name', 'file.extension', async function() {
    const file = await this.get('file');
    if (file) {
      const filename = `${this.name}.${file.extension}`;
      return sanitize(filename, { // file-system-safe
        replacement: '_',
      });
    }
    return undefined;
  }),

  downloadFileLink: computed('downloadFilename', 'file.downloadLink', async function() {
    const file = await this.get('file');
    if (file) {
      return `${file.downloadLink}?name=${encodeURIComponent(await this.get('downloadFilename'))}`; // url-safe
    }
    return undefined;
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
