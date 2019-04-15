import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;
/* 
  propertyToShow is used in the agenda to display the right values based on the agendaName.
**/
export default Model.extend({
  priority: attr('number'),
  created: attr('date'),
  record: attr('string'),
  retracted: attr('boolean'),
  showAsRemark: attr('boolean'),

  titlePress: attr('string'),
  textPress: attr('string'),
  forPress: attr('boolean'),

  shortTitle: attr('string'),
  title: attr('string'),

  formallyOk: attr('boolean'),

  postponedTo: belongsTo('postponed'),
  agenda: belongsTo('agenda', { inverse: null }),
  decision: belongsTo('decision'),
  subcase: belongsTo('subcase', { inverse: null }),

  confidentiality: belongsTo('confidentiality', { inverse: null }),
  newsletterInfo: belongsTo('newsletter-info'),
  meetingRecord: belongsTo('meeting-record'),

  remarks: hasMany('remark'),
  attendees: hasMany('mandatee', { inverse: null }),
  mandatees: hasMany('mandatee', { inverse: null }),
  approvals: hasMany('approval'),
  documentVersions: hasMany('document-version'),

  themes: hasMany('theme'),
  sortedThemes: computed('themes', function () {
    return this.get('themes').sortBy('label');
  }),

  governmentDomains: hasMany('government-domain', { inverse: null }),
  phases: hasMany('subcase-phase'),

  isPostponed: computed('retracted', 'postponedTo', function () {
    return this.get('postponedTo').then((session) => {
      return session || this.get('retracted');
    });
  }),

  isDesignAgenda: computed('agenda', function () {
    const agendaName = this.get('agenda.name');
    if (agendaName === "Ontwerpagenda") {
      return true;
    } else {
      return false;
    }
  }),

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
  })

});
