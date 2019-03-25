import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  title: attr('string'),
  text: attr('string'),
  created: attr('date'),
  modified: attr('date'),
  agenda: belongsTo('agenda'),
  documentVersions: hasMany('document-version'),

  documents: computed('documentVersions', async function() {
    const documentVersions = await this.get('documentVersions');
    const documents = await Promise.all(documentVersions.map(documentVersion => {
      return documentVersion.get('document');
    }));
    return documents.uniqBy('id');
  })
});
