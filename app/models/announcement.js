import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, belongsTo, hasMany,
} = DS;

export default Model.extend({
  title: attr('string'),
  text: attr('string'),
  created: attr('date'),
  modified: attr('date'),
  agenda: belongsTo('agenda'),
  documentVersions: hasMany('document-version'),

  documents: computed('documentVersions', async function () {
    const documentVersions = await this.get('documentVersions');
    const documents = await Promise.all(documentVersions.map((documentVersion) => documentVersion.get('document')));
    return documents.uniqBy('id');
  }),
});
