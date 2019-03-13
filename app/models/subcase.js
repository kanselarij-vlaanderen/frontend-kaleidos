import DS from 'ember-data';
import { computed } from '@ember/object';

const { attr, Model, hasMany, belongsTo } = DS;

export default Model.extend({
  created: attr('date'),
  shortTitle: attr('string'),
  title: attr('string'),
  showAsRemark: attr('boolean'),

  case: belongsTo('case'),
  relatedTo: hasMany('subcase', { inverse: null }),
  meeting: belongsTo('meeting'),
  phase: belongsTo('subcase-phase'),
  consulationRequests: hasMany('consulation-request'),
  governmentDomains: hasMany('government-domain'),
  agendaitems: hasMany('agendaitem'),
  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version'),
  themes: hasMany('theme'),
  mandatees: hasMany('mandatee'),

  documents: computed('documentVersions', async function() {
    const documentVersions = await this.get('documentVersions');
    const documents = await Promise.all(documentVersions.map(documentVersion => {
      return documentVersion.get('document');
    }));
    return documents.uniqBy('id');
  }),

  documentsLength: computed('documents', function() {
    return this.get('documents').then((documents) => {
      return documents.get('length');
    });
  })

});
