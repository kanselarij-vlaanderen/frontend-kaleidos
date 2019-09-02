import DS from 'ember-data';
import { computed } from '@ember/object';
import formatVersionedDocumentName from 'fe-redpencil/utils/format-versioned-document-name';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  created: attr('date'),
  chosenFileName: attr('string'),
  identificationNumber: attr('string'),
  versionNumber: attr('number'),
  serialNumber: attr('string'),

  document: belongsTo('document', { inverse: null }),
  subcase: belongsTo('subcase', { inverse: null }),
  agendaitem: belongsTo('agendaitem', { inverse: null }),
  announcement: belongsTo('announcement'),
  file: belongsTo('file'),
  convertedFile: belongsTo('file', { inverse: null }),
  newsletter: belongsTo('newsletter-info'),

  name: computed('document.name', async function() {
    return formatVersionedDocumentName(this.get('document.name'), this.get('versionNumber'));
  }),
});
