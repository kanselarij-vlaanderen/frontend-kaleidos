import DS from 'ember-data';
import { computed } from '@ember/object';
import sanitize from 'sanitize-filename';
import { deprecatingAlias } from '@ember/object/computed';
import moment from 'moment';
import config from '../utils/config';
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
  publicSince: attr('datetime'),
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

  changePublicSince() {
    if (this.get('accessLevel').get('id') === config.publiekAccessLevelId && !this.get('confidential') && !this.get('publicSince')) {
      this.set('publicSince', moment().utc()
        .toDate());
    }
    if (this.get('accessLevel').get('id') !== config.publiekAccessLevelId || this.get('confidential')) {
      this.set('publicSince', undefined);
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
        this.changePublicSince();
        break;
    }

    return parentSave.call(this, ...arguments);
  },

});
