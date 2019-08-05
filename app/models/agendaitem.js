import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';
let { Model, attr, belongsTo, hasMany, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  modelName: alias('constructor.modelName'),

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
  formallyOk: attr('string'),

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

  sortedThemes: computed('themes', function() {
    return this.get('themes').sortBy('label');
  }),

  isPostponed: computed('retracted', 'postponedTo', function() {
    return this.get('postponedTo').then(session => {
      return session || this.get('retracted');
    });
  }),

  decisions: computed('subcase.decisions', function() {
    return PromiseArray.create({
      promise: this.store.query('decision', {
        filter: {
          subcase: { id: this.subcase.get('id') }
        },
        sort: 'approved'
      })
    });
  }),

  isDesignAgenda: computed('agenda', function() {
    const agendaName = this.get('agenda.name');
    if (agendaName === 'Ontwerpagenda') {
      return true;
    } else {
      return false;
    }
  }),

  documents: computed('documentVersions.@each', function() {
    return PromiseArray.create({
      promise: this.get('documentVersions').then(documentVersions => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map(item => item.get('id')).join(',');

          return this.store.query('document', {
            filter: {
              'document-versions': { id: documentVersionIds }
            },
            sort: 'type.priority',
            include: 'document-versions'
          });
        }
      })
    });
  }),

  documentsLength: computed('documents.@each', function() {
    return this.get('documents').then(documents => {
      return documents.get('length');
    });
  }),

  nota: computed('documentVersions', function() {
    return PromiseObject.create({
      promise: this.get('documentVersions').then(documentVersions => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map(item => item.get('id')).join(',');

          return this.store
            .query('document', {
              filter: {
                'document-versions': { id: documentVersionIds },
                type: { id: CONFIG.notaID }
              },
              include: 'document-versions'
            })
            .then(notas => {
              return notas.get('firstObject');
            });
        }
      })
    });
  }),

  sortedMandatees: computed('mandatees.@each', function() {
    return this.get('mandatees').sortBy('priority');
  }),

  subcasesFromCase: computed('subcase', function() {
    if (!this.get('subcase.id')) {
      return [];
    }
    return PromiseArray.create({
      promise: this.subcase.get('case').then(caze => {
        if (caze) {
          return caze.get('subcases').then(subcases => {
            return subcases.filter(item => item.get('id') != this.get('subcase.id'));
          });
        }
      })
    });
  }),

  formallyOkToShow: computed('formallyOk', function() {
    const options = CONFIG.formallyOkOptions;
    const { formallyOk } = this;
    const foundOption = options.find(formallyOkOption => formallyOkOption.uri === formallyOk);

    return EmberObject.create(foundOption);
  }),

  requestedBy: computed('subcase.requestedBy', function() {
    return PromiseObject.create({
      promise: this.get('subcase.requestedBy').then(requestedBy => {
        return requestedBy;
      })
    });
  })
});
