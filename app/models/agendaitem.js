import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany, PromiseArray } = DS;

export default Model.extend({
  priority: attr('number'),
  created: attr('date'),
  record: attr('string'),
  retracted: attr('boolean'),
  showAsRemark: attr('boolean'),
  modified: attr('date'),
  titlePress: attr('string'),
  textPress: attr('string'),
  forPress: attr('boolean'),
  shortTitle: attr('string'),
  title: attr('string'),
  formallyOk: attr('boolean'),

  postponedTo: belongsTo('postponed'),
  agenda: belongsTo('agenda', { inverse: null }),
  subcase: belongsTo('subcase', { inverse: null }),
  newsletterInfo: belongsTo('newsletter-info'),
  meetingRecord: belongsTo('meeting-record'),

  remarks: hasMany('remark'),
  mandatees: hasMany('mandatee'),
  approvals: hasMany('approval'),
  documentVersions: hasMany('document-version', { inverse: null }),
  phases: hasMany('subcase-phase'),
  themes: hasMany('theme'),

  sortedThemes: computed('themes', function () {
    return this.get('themes').sortBy('label');
  }),

  isPostponed: computed('retracted', 'postponedTo', function () {
    return this.get('postponedTo').then((session) => {
      return session || this.get('retracted');
    });
  }),

  decisions: computed('subcase.decisions.@each', function () {
    return PromiseArray.create({
      promise: this.get('subcase').then((subcase) => {
        return subcase.get('decisions').then((decisions) => {
          return decisions;
        })
      })
    })
  }),

  isDesignAgenda: computed('agenda', function () {
    const agendaName = this.get('agenda.name');
    if (agendaName === "Ontwerpagenda") {
      return true;
    } else {
      return false;
    }
  }),

  documents: computed('documentVersions.@each', async function () {
    const documentVersions = await this.get('documentVersions');
    const documents = await Promise.all(documentVersions.map(documentVersion => {
      return documentVersion.get('document');
    }));
    return documents.uniqBy('id');
  }),

  documentsLength: computed('documents.@each', function () {
    return this.get('documents').then((documents) => {
      return documents.get('length');
    });
  }),

  sortedMandatees: computed('mandatees', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  subcasesFromCase: computed('subcase', function () {
    return PromiseArray.create({
      promise: this.get('subcase').then((subcase) => {
        return subcase.get('case.subcases').then((subcases) => {
          return subcases;
        });
      })
    })
  })
});
