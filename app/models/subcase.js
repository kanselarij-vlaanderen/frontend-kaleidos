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
  requestedForMeeting: belongsTo('meeting'),
  phases: hasMany('subcase-phase'),
  consulationRequests: hasMany('consulation-request'),
  governmentDomains: hasMany('government-domain', { inverse: null }),
  agendaitems: hasMany('agendaitem'),
  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version'),
  themes: hasMany('theme'),
  mandatees: hasMany('mandatee'),

  documents: computed('documentVersions', async function () {
    const documentVersions = await this.get('documentVersions');
    const documents = await Promise.all(documentVersions.map(documentVersion => {
      return documentVersion.get('document');
    }));
    return documents.uniqBy('id');
  }),

  documentsLength: computed('documents', function () {
    return this.get('documents').then((documents) => {
      return documents.get('length');
    });
  }),

  sortedMandatees: computed('mandatees', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  sortedThemes: computed('themes', function () {
    return this.get('themes').sortBy('label');
  }),

  hasAgendaItem: computed('agendaitems', function () {
    const { id, store } = this;
    return store.query('agendaitem', {
      filter: { subcase: { id: id } },
      sort: 'created'
    }).then((agendaitems) => {
      const lastAgendaItem = agendaitems.get('firstObject');
      if (lastAgendaItem) {
        return lastAgendaItem.get('postponedTo').then((postPoned) => {
          const retracted = lastAgendaItem.get('retracted');
          if (!postPoned && !retracted) {
            return true;
          } else {
            return false;
          }
        });
      } else {
        return false;
      }
    })
  }),

  lastPhaseCreated: computed('phases', function () {

  })

});
