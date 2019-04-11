import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  priority: attr('number'),
  created: attr('date'),
  record: attr('string'),
  // showAsRemark: attr('boolean'),
  retracted: attr('boolean'),

  titlePress: attr('string'),
  textPress: attr('string'),
  forPress: attr('boolean'),

  shortTitle: attr('string'),
  title: attr('string'),
  formallyOk: attr('boolean'),
  showAsRemark: attr('boolean'),

  postponedTo: belongsTo('postponed'),
  agenda: belongsTo('agenda', { inverse: null }),
  decision: belongsTo('decision'),
  subcase: belongsTo('subcase', { inverse: null }),
  confidentiality: belongsTo('confidentiality', {inverse:null}),
  newsletterInfo: belongsTo('newsletter-info'),
  meetingRecord: belongsTo('meeting-record'),

  remarks: hasMany('remark'),
  attendees: hasMany('mandatee', { inverse: null }),
  mandatees: hasMany('mandatee', {inverse: null}), 
  approvals: hasMany('approval'),
  documentVersions: hasMany('document-version'),
  themes: hasMany('theme'),
  governmentDomains: hasMany('government-domain', { inverse: null }),
  phases: hasMany('subcase-phase', { inverse: null }),

  isPostponed: computed('retracted', 'postponedTo', function () {
    return this.get('postponedTo').then((session) => {
      return session || this.get('retracted');
    });
  }),

  documents: computed('documentVersions', async function () {
    const documentVersions = await this.get('documentVersions');
    const documents = await Promise.all(documentVersions.map(documentVersion => {
      return documentVersion.get('document');
    }));
    return documents.uniqBy('id');
  }),

  sortedMandatees: computed('mandatees', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  sortedThemes: computed('themes', function () {
    return this.get('themes').sortBy('label');
  })
});
