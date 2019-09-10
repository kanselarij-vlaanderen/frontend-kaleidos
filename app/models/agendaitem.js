import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';
let { Model, attr, belongsTo, hasMany, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  modelName: alias('constructor.modelName'),
  agendaService: inject(),
  addedAgendaitems: alias('agendaService.addedAgendaitems'),
  addedDocuments: alias('agendaService.addedDocuments'),

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

  number: computed('displayPriority', 'priority', function() {
    const { priority, displayPriority} = this;
    if(!priority) {
      return displayPriority;
    } else {
      return priority;
    }
  }),

  sortedThemes: computed('themes', function() {
    return this.get('themes').sortBy('label');
  }),

  isPostponed: computed('retracted', 'postponedTo', function() {
    return this.get('postponedTo').then((session) => {
      return session || this.get('retracted');
    });
  }),

  decisions: computed('subcase.decisions', function() {
    return PromiseArray.create({
      promise: this.store.query('decision', {
        filter: {
          subcase: { id: this.subcase.get('id') },
        },
        sort: 'approved',
      }),
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
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');

          return this.store.query('document', {
            filter: {
              'document-versions': { id: documentVersionIds },
            },
            include: 'document-versions,type',
          }).then((documents) => {
            // Sorting is done in the frontend to work around a Virtuoso issue, where
            // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
            // some items not being returned. By not having a sort parameter, this doesn't occur.
            return documents.sortBy('type.priority', 'numberVr');
          });
        }
      }),
    });
  }),

  documentsLength: computed('documents.@each', function() {
    return this.get('documents').then((documents) => {
      return documents ? documents.get('length') : 0;
    });
  }),

  nota: computed('documentVersions', function() {
    return PromiseObject.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');

          return this.store
            .query('document', {
              filter: {
                'document-versions': { id: documentVersionIds },
                type: { id: CONFIG.notaID },
              },
              include: 'document-versions',
            })
            .then((notas) => {
              return notas.get('firstObject');
            });
        }
      }),
    });
  }),

  sortedMandatees: computed('mandatees.@each', function() {
    return this.get('mandatees').sortBy('priority');
  }),

  subcasesFromCase: computed('subcase', function() {
    if (!this.get('subcase.id')) {
      return [];
    }
    return this.subcase.get('subcasesFromCase');
  }),

  formallyOkToShow: computed('formallyOk', function() {
    const options = CONFIG.formallyOkOptions;
    const { formallyOk } = this;
    const foundOption = options.find((formallyOkOption) => formallyOkOption.uri === formallyOk);

    return EmberObject.create(foundOption);
  }),

  requestedBy: computed('subcase.requestedBy', function() {
    return PromiseObject.create({
      promise: this.get('subcase.requestedBy').then((requestedBy) => {
        return requestedBy;
      }),
    });
  }),

  checkAdded: computed('id', 'addedAgendaitems.@each', function() {
    if (this.addedAgendaitems) return this.addedAgendaitems.includes(this.id);
  }),

  hasChanges: computed('checkAdded', 'hasAddedDocuments', function() {
    return this.hasAddedDocuments.then((hasAddedDocuments) => {
      return this.checkAdded || hasAddedDocuments;
    });
  }),

  hasAddedDocuments: computed('documents.@each', 'addedDocuments.@each', function() {
    return this.get('documents').then((documents) => {
      if (!documents) return false;
      return documents.every((document) => document.get('checkAdded'));
    });
  }),
});
