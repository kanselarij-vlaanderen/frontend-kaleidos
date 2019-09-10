import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { alias } from '@ember/object/computed';

const { attr, Model, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  modelName: alias('constructor.modelName'),
  store: inject(),
  intl: inject(),

  created: attr('date'),
  modified: attr('date'),
  shortTitle: attr('string'),
  title: attr('string'),
  subcaseIdentifier: attr('string'),
  showAsRemark: attr('boolean'),
  formallyOk: attr('boolean'),
  isArchived: attr('boolean'),
  freezeAccessLevel: attr('boolean'),
  concluded: attr('boolean'),
  subcaseName: attr('string'),

  phases: hasMany('subcase-phase', { inverse: null }),
  consulationRequests: hasMany('consulation-request', { inverse: null }),
  iseCodes: hasMany('ise-code'),
  agendaitems: hasMany('agendaitem', { inverse: null }),
  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version'),
  linkedDocumentVersions: hasMany('document-version'),
  themes: hasMany('theme'),
  mandatees: hasMany('mandatee'),
  approvals: hasMany('approval', { serialize: false }),
  decisions: hasMany('decision'),

  type: belongsTo('subcase-type'),
  case: belongsTo('case', { inverse: null }),
  requestedForMeeting: belongsTo('meeting', { inverse: null }),
  newsletterInfo: belongsTo('newsletter-info'),
  requestedBy: belongsTo('mandatee', { inverse: null }),
  accessLevel: belongsTo('access-level'),


  firstPhase: computed('phases.@each', function () {
    return PromiseObject.create({
      promise: this.store.query('subcase-phase', {
        filter: {
          subcase: { id: this.get('id') }
        },
        sort: 'date',
        include: 'code'
      }).then((subcasePhases) => {
        return subcasePhases.get('firstObject');
      })
    });
  }),

  nameToShow: computed('subcaseName', function () {
    const { subcaseName, title, shortTitle } = this;
    if (subcaseName) {
      return `${this.intl.t('in-function-of')} ${subcaseName.toLowerCase()}`;
    } else if (shortTitle) {
      return shortTitle;
    } else if (title) {
      return title;
    } else {
      return `No name found.`
    }
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
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');
          return this.store.query('document', {
            filter: {
              'document-versions': { id: documentVersionIds },
            },
            include: 'type,document-versions',
          }).then((documents) => {
            // Sorting is done in the frontend to work around a Virtuoso issue, where
            // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
            // some items not being returned. By not having a sort parameter, this doesn't occur.
            return documents.sortBy('type.priority', 'numberVr');
          });
        }
      })
    });
  }),

  documentsLength: computed('documents', function () {
    return PromiseObject.create({
      promise: this.get('documents').then((documents) => {
        return documents.get('length');
      })
    });
  }),

  linkedDocuments: computed('linkedDocumentVersions.@each', function () {
    return PromiseArray.create({
      promise: this.get('linkedDocumentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');
          return this.store.query('document', {
            filter: {
              'document-versions': { id: documentVersionIds },
            },
            include: 'type,document-versions',
          }).then((documents) => {
            // Sorting is done in the frontend to work around a Virtuoso issue, where
            // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
            // some items not being returned. By not having a sort parameter, this doesn't occur.
            return documents.sortBy('type.priority', 'numberVr');
          });
        }
      })
    });
  }),

  linkedDocumentsLength: computed('linkedDocuments', function () {
    return PromiseObject.create({
      promise: this.get('linkedDocuments').then((documents) => {
        return documents.get('length');
      })
    });
  }),

  sortedMandatees: computed('mandatees', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  sortedApprovals: computed('approvals.@each', function () {
    return
  }),

  sortedThemes: computed('themes', function () {
    return this.get('themes').sortBy('label');
  }),

  sortedPhases: computed('phases.@each', function () {
    return PromiseArray.create({
      promise: this.get('phases').then((phases) => {
        return phases.sortBy('date');
      })
    });
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
  }),

  onAgendaInfo: computed('phases.@each', function () {
    return this.findPhaseDateByCodeId(CONFIG.onAgendaCodeId);
  }),

  decidedInfo: computed('phases.@each', function () {
    return this.findPhaseDateByCodeId(CONFIG.decidedCodeId);
  }),

  async findPhaseDateByCodeId(codeId) {
    const subcasePhases = await this.get('phases');
    return subcasePhases.find(async (phase) => {
      const code = await phase.get('code');
      if (code) {
        const id = code.get('id');
        if (id && id === codeId) {
          return phase.get('date');
        }
      }
      return false;
    });
  },

  submitter: computed('case.submitter', function () {
    return PromiseObject.create({
      promise: this.get('case').then((caze) => {
        return caze.get('submitter').then((submitter) => {
          return submitter;
        });
      })
    });
  }),

  approved: computed('decisions', function () {
    return PromiseObject.create({
      promise: this.get('decisions').then((decisions) => {
        const approvedDecisions = decisions.map((decision) => decision.get('approved'));
        if (approvedDecisions && approvedDecisions.length === 0) {
          return false;
        }
        const foundNonApprovedDecision = approvedDecisions.includes(false);
        if (foundNonApprovedDecision) {
          return false;
        } else {
          return true;
        }
      })
    })
  }),

  subcasesFromCase: computed('case.subcases.@each', function () {
    return PromiseArray.create({
      promise: this.get('case').then((caze) => {
        return caze.get('subcases').then((subcases) => {
          return subcases.filter((item) => item.get('id') != this.id).sort(function (a, b) {
            return b.created - a.created; //  We want to sort descending on date the subcase was concluded. In practice, sorting on created will be close
          });
        });
      })
    })
  }),

  remarkType: computed('showAsRemark', function () {
    let id = "";
    if (this.showAsRemark) {
      id = CONFIG.remarkId;
    } else {
      id = CONFIG.notaID;
    }
    return this.store.findRecord('case-type', id);
  })
});
