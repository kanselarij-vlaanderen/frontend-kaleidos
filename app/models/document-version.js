import DS from 'ember-data';
import { computed } from '@ember/object';
import sanitize from 'sanitize-filename';
import { deprecatingAlias } from '@ember/object/computed';
import moment from 'moment';

const {
  Model, attr, belongsTo,
} = DS;

export default Model.extend({
  name: attr('string'),
  created: attr('datetime'),
  modified: attr('datetime'),
  chosenFileName: deprecatingAlias('name', {
    id: 'model-refactor.documents',
    until: '?',
  }),
  confidential: attr('boolean'),
  accessLevel: belongsTo('access-level'),

  file: belongsTo('file'),
  convertedFile: belongsTo('file', {
    inverse: null,
  }),

  documentContainer: belongsTo('document', {
    inverse: null,
  }),
  document: deprecatingAlias('documentContainer', {
    id: 'model-refactor.documents',
    until: '?',
  }),
  nextVersion: belongsTo('document-version', {
    inverse: 'previousVersion',
  }),
  previousVersion: belongsTo('document-version', {
    inverse: 'nextVersion',
  }),

  subcase: belongsTo('subcase', {
    inverse: null,
  }),
  agendaitem: belongsTo('agendaitem', {
    inverse: null,
  }),
  announcement: belongsTo('announcement'),
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

  storeAccessLevel(accessLevel) {
    this.set('modified', moment().toDate());
    this.set('accessLevel', accessLevel);
    return this.save();
  },

  async toggleConfidential() {
    this.set('modified', moment().toDate());
    this.toggleProperty('confidential');
    await this.save();
  },

});
