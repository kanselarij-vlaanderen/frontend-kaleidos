import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

let { Model, attr, belongsTo, hasMany, PromiseArray } = DS;

export default Model.extend({
  store: inject(),

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
  meetingRecord: belongsTo('meeting-record'),

  remarks: hasMany('remark'),
  mandatees: hasMany('mandatee'),
  approvals: hasMany('approval'),
  documentVersions: hasMany('document-version'),
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
      promise: this.store.query('decision',
        {
          filter: {
            subcase: { id: this.subcase.get('id') },
          },
          sort: "approved"
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

  documents: computed('documentVersions', function () {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');

          return this.store.query('document', {
            filter: {
              'document-versions': { id: documentVersionIds },
            },
            sort: 'type.priority',
            include: 'document-versions'
          })
        }
      })
    });
  }),

  documentsLength: computed('documents.@each', function () {
    return this.get('documents').then((documents) => {
      return documents.get('length');
    });
  }),

  sortedMandatees: computed('mandatees.@each', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  subcasesFromCase: computed('subcase', function () {
    return PromiseArray.create({
      promise: this.subcase.get('case').then((caze) => {
        if (caze) {
          return caze.get('subcases').then((subcases) => {
            return subcases;
          });
        }
      })
    })
  })
});
