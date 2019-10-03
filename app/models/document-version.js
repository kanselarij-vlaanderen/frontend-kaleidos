import DS from 'ember-data';
import { computed } from '@ember/object';
import formatVersionedDocumentName from 'fe-redpencil/utils/format-versioned-document-name';
import sanitize from 'sanitize-filename';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  created: attr('date'),
  chosenFileName: attr('string'),
  versionNumber: attr('number'),
  numberVr: attr('string'),
  confidential: attr('boolean'),

  file: belongsTo('file'),
  convertedFile: belongsTo('file', { inverse: null }),
  document: belongsTo('document', { inverse: null }),
  subcase: belongsTo('subcase', { inverse: null }),
  agendaitem: belongsTo('agendaitem', { inverse: null }),
  announcement: belongsTo('announcement'),
  newsletter: belongsTo('newsletter-info'),
  accessLevel: belongsTo('access-level'),
  meeting: belongsTo('meeting', { inverse: null }),

  name: computed('document.name', async function() {
    return formatVersionedDocumentName(await this.get('document.name'), this.get('versionNumber'));
  }),

  downloadFilename: computed('name', 'file.extension', async function() {
    let filename = `${await this.get('name')}.${await this.get('file.extension')}`;
    return sanitize(filename, {replacement: '_'});
  }),

  storeAccessLevel(accessLevel){
    this.set('accessLevel', accessLevel);
    return this.save();
  },

  toggleConfidential: async function(){
    this.toggleProperty('confidential');
    await this.save();
  }

});
