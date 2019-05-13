import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

const { attr, Model, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  store: inject(),
  intl: inject(),

  created: attr('date'),
  modified: attr('date'),
  shortTitle: attr('string'),
  title: attr('string'),
  showAsRemark: attr('boolean'),
  formallyOk: attr('boolean'),
  isArchived: attr('boolean'),
  confidential: attr('boolean'),
  concluded: attr('boolean'),
  subcaseName: attr('string'),

  phases: hasMany('subcase-phase', { inverse: null }),
  consulationRequests: hasMany('consulation-request', { inverse: null }),
  iseCodes: hasMany('ise-code'),
  agendaitems: hasMany('agendaitem', { inverse: null }),
  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version', { inverse: null }),
  themes: hasMany('theme'),
  mandatees: hasMany('mandatee'),
  approvals: hasMany('approval'),
  // relatedTo: hasMany('subcase', { inverse: null }),

  confidentiality: belongsTo('confidentiality'),
  decision: belongsTo('decision'),
  type: belongsTo('subcase-type'),
  case: belongsTo('case', { inverse: null }),
  requestedForMeeting: belongsTo('meeting', { inverse: null }),

  firstPhase: computed('phases.@each', function () {
    return PromiseObject.create({
      promise: this.store.query('subcase-phase', { filter: { subcase: { id: this.get('id') } }, sort: 'date', include: 'code' }).then((subcasePhases) => {
        return subcasePhases.get('firstObject');
      })
    });
  }),


  nameToShow: computed('subcaseName', function () {
    const subcaseName = this.get('subcaseName');
    if (subcaseName)
      return `${this.intl.t('in-function-of')} ${subcaseName.toLowerCase()}`;
  }),

  async documentNumberOfVersion(version) {
    const documents = await this.get('documents');
    const sortedDocuments = documents.sortBy('created');
    const targetDocument = await version.get('document');
    let foundIndex;
    sortedDocuments.map((document, index) => {
      if (document == targetDocument) {
        foundIndex = index;
      }
    })
    return foundIndex;
  },

  documents: computed('documentVersions.@each', function () {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        return Promise.all(documentVersions.map(documentVersion => {
          return documentVersion.get('document');
        })).then((documents) => { return documents.uniqBy('id') })
      })
    });
  }),

  documentsLength: computed('documents.@each', function () {
    return PromiseObject.create({
      promise: this.get('documents').then((documents) => {
        return documents.get('length');
      })
    });
  }),

  sortedMandatees: computed('mandatees', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  sortedThemes: computed('themes', function () {
    return this.get('themes').sortBy('label');
  }),

  hasAgendaItem: computed('agendaitems.@each', function () {
    const { id, store } = this;
    return PromiseObject.create({
      promise: store.query('agendaitem', {
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
    })
  }),

  agendaitemsOnDesignAgendaToEdit: computed('id', function () {
    return this.store.query('agendaitem', {
      filter: {
        subcase: { id: this.get('id') },
        agenda: { name: "Ontwerpagenda" }
      }
    })
  })
});
