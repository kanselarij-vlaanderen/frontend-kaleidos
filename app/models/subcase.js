import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';
import moment from 'moment';
import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import { sortDocuments, getDocumentsLength } from 'fe-redpencil/utils/documents';

const { attr, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;

export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  store: inject(),
  intl: inject(),

  created: attr('datetime'),
  modified: attr('datetime'),
  shortTitle: attr('string'),
  title: attr('string'),
  subcaseIdentifier: attr('string'),
  showAsRemark: attr('boolean'),
  confidential: attr('boolean'),
  formallyOk: attr('boolean'),
  isArchived: attr('boolean'),
  concluded: attr('boolean'),
  subcaseName: attr('string'),

  phases: hasMany('subcase-phase', { inverse: null }),
  consulationRequests: hasMany('consulation-request', { inverse: null }),
  iseCodes: hasMany('ise-code'),
  agendaitems: hasMany('agendaitem', { inverse: null }),
  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version'),
  linkedDocumentVersions: hasMany('document-version'),
  mandatees: hasMany('mandatee'),
  treatments: hasMany('agenda-item-treatment'),

  type: belongsTo('subcase-type'),
  case: belongsTo('case', { inverse: null }),
  requestedForMeeting: belongsTo('meeting', { inverse: null }),
  newsletterInfo: belongsTo('newsletter-info'),
  requestedBy: belongsTo('mandatee', { inverse: null }),
  accessLevel: belongsTo('access-level'),

  documentsLength: computed('documents', function () {
    return getDocumentsLength(this, 'documents');
  }),

  linkedDocumentsLength: computed('linkedDocuments', function () {
    return getDocumentsLength(this, 'linkedDocuments');
  }),

  documents: computed('documentVersions.@each.name', function () {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              'documents': { id: documentVersionIds },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => {
            return sortDocuments(this.get('documentVersions'), containers);
          });
        }
      })
    });
  }),

  linkedDocuments: computed('linkedDocumentVersions.@each', function () {
    return PromiseArray.create({
      promise: this.get('linkedDocumentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              'documents': { id: documentVersionIds },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => {
            return sortDocuments(this.get('linkedDocumentVersions'), containers);
          });
        }
      })
    });
  }),

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

  postponedPhases: computed('phases.@each', function () {
    return this.store
      .query('subcase-phase', {
        filter: {
          subcase: { id: this.get('id') },
          code: { id: CONFIG.postponedCodeId }
        }
      })
      .then(subcasePhases => {
        return subcasePhases;
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
    });
    return foundIndex;
  },

  sortedMandatees: computed('mandatees.@each', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  sortedPhases: computed('phases.@each', 'isPostponed', function () {
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
        sort: '-created'
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

  agendaitemsOnDesignAgendaToEdit: computed('id', 'agendaitems', async function () {
    return await this.store.query('agendaitem', {
      filter: {
        subcase: { id: this.get('id') },
        agenda: { status: { id: '2735d084-63d1-499f-86f4-9b69eb33727f' } }
      }
    });
  }),

  meetings: computed('agendaitems.@each', async function () {
    const agendaitems = await this.get('agendaitems');
    const meetings = await Promise.all(agendaitems.map(async (agendaitem) => {
      const agenda = await agendaitem.get('agenda');
      return agenda ? agenda.get('createdFor') : null;
    }));
    // find met ===
    return meetings.reduce((addedMeetings, meeting) => {
      if (meeting && !addedMeetings.find(adddedMeeting => meeting === adddedMeeting)) {
        addedMeetings.push(meeting)
      }
      return addedMeetings
    }, A([]))
  }),

  latestMeeting: computed('meetings.@each', function () {
    return PromiseObject.create({
      promise: this.get('meetings').then((meetings) => {
        return meetings.reduce((meeting1, meeting2) =>
          moment(meeting1.plannedStart).isAfter(moment(meeting2.plannedStart))
            ? meeting1
            : meeting2)
      })
    })
  }),

  latestAgenda: computed('latestMeeting', async function () {
    const lastMeeting = await this.get('latestMeeting');
    return lastMeeting.get('latestAgenda');
  }),

  latestAgendaItem: computed('latestAgenda.agendaitems.@each.postponedTo', async function () {
    const latestAgenda = await this.get('latestAgenda');
    const latestAgendaItems = await latestAgenda.get('agendaitems');
    const agendaitems = await this.agendaitems;

    return latestAgendaItems.find(item => agendaitems.includes(item));
  }),

  onAgendaInfo: computed('latestMeeting', async function () {
    const latestMeeting = await this.get('latestMeeting');
    return latestMeeting.plannedStart;
  }),

  decidedInfo: computed('phases.@each', function () {
    return this.findPhaseDateByCodeId(CONFIG.decidedCodeId);
  }),

  // TODO tocheck @michael treatments.length is hier 0 - not sure yet why.

  approved: computed('treatments', function () {
    console.log(this.get('treatments'));
    return PromiseObject.create({
      promise: this.get('treatments').then((treatments) => {
        const approvedTreatments = treatments.map((treatment) => {
            return treatment.get('decisionResultCode').get('uri') == 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/56312c4b-9d2a-4735-b0b1-2ff14bb524fd';
          }
        );
        if (approvedTreatments && approvedTreatments.length === 0) {
          return false;
        }
        const foundNonApprovedTreatment = approvedTreatments.includes(false);
        if (foundNonApprovedTreatment) {
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
    let id = '';
    if (this.showAsRemark) {
      id = CONFIG.remarkId;
    } else {
      id = CONFIG.notaCaseTypeID;
    }
    return this.store.findRecord('case-type', id);
  }),

  isPostponed: computed('latestAgendaItem', 'latestAgendaItem.isPostponed', async function () {
    const latestAgendaItem = await this.get('latestAgendaItem');
    if (latestAgendaItem) {
      return latestAgendaItem.isPostponed;
    }
    return false;
  }),

  showInNewsletter: computed('agendaitems.@each.showInNewsletter', async function () {
    const latestAgendaItem = await this.get('latestAgendaItem');
    if (latestAgendaItem) {
      return await latestAgendaItem.get('showInNewsletter');
    } else {
      return null;
    }
  }),

  async findPhaseDateByCodeId(codeId) {
    const subcasePhases = await this.get('phases');
    const foundPhase = subcasePhases.find(async (phase) => {
      const code = await phase.get('code');
      if (code) {
        const id = code.get('id');
        if (id && id === codeId) {
          return true;
        }
      }
      return false;
    });
    if (foundPhase) {
      return foundPhase.get('date')
    }
    return null;
  }
});
