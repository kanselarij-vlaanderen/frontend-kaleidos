import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { alias } from '@ember/object/computed';
import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import {
  sortDocuments, getDocumentsLength
} from 'fe-redpencil/utils/documents';

const {
  attr, hasMany, belongsTo, PromiseArray, PromiseObject,
} = DS;

export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  store: inject(),
  intl: inject(),
  subcasesService: inject(),

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

  consulationRequests: hasMany('consulation-request', {
    inverse: null,
  }),
  iseCodes: hasMany('ise-code'),
  agendaActivities: hasMany('agenda-activity', {
    inverse: null,
  }),
  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version'),
  linkedDocumentVersions: hasMany('document-version'),
  mandatees: hasMany('mandatee'),
  decisions: hasMany('decision'),

  type: belongsTo('subcase-type'),
  case: belongsTo('case', {
    inverse: null,
  }),
  requestedForMeeting: belongsTo('meeting', {
    inverse: null,
  }),
  newsletterInfo: belongsTo('newsletter-info'),
  requestedBy: belongsTo('mandatee', {
    inverse: null,
  }),
  accessLevel: belongsTo('access-level'),

  latestActivity: computed('agendaActivities', 'agendaActivities.@each', async function() {
    const activities = await this.get('agendaActivities').then((activities) => activities.sortBy('startDate'));
    if (activities && activities.length > 0) {
      return activities.get('lastObject');
    }
    return null;
  }),

  // eslint-disable-next-line ember/use-brace-expansion
  phases: computed('agendaActivities.agendaitems', 'agendaActivities.agendaitems.@each', 'latestActivity.agendaitems.@each.retracted', 'approved', async function() {
    const activities = await this.get('agendaActivities');
    if (activities && activities.length > 0) {
      const phases = await this.get('subcasesService').getSubcasePhases(this);
      return phases;
    }
    return null;
  }),

  documentsLength: computed('documents', function() {
    return getDocumentsLength(this, 'documents');
  }),

  linkedDocumentsLength: computed('linkedDocuments', function() {
    return getDocumentsLength(this, 'linkedDocuments');
  }),

  documents: computed('documentVersions.@each.name', function() {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              documents: {
                id: documentVersionIds,
              },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => sortDocuments(this.get('documentVersions'), containers));
        }
      }),
    });
  }),

  linkedDocuments: computed('linkedDocumentVersions.@each', function() {
    return PromiseArray.create({
      promise: this.get('linkedDocumentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              documents: {
                id: documentVersionIds,
              },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => sortDocuments(this.get('linkedDocumentVersions'), containers));
        }
      }),
    });
  }),

  nameToShow: computed('subcaseName', function() {
    const {
      subcaseName, title, shortTitle,
    } = this;
    if (subcaseName) {
      return `${this.intl.t('in-function-of')} ${subcaseName.toLowerCase()}`;
    } if (shortTitle) {
      return shortTitle;
    } if (title) {
      return title;
    }
    return 'No name found.';
  }),

  async documentNumberOfVersion(version) {
    const documents = await this.get('documents');

    const sortedDocuments = documents.sortBy('created');
    const targetDocument = await version.get('document');
    let foundIndex;
    sortedDocuments.map((document, index) => {
      if (document === targetDocument) {
        foundIndex = index;
      }
    });
    return foundIndex;
  },

  sortedMandatees: computed('mandatees.@each', function() {
    return this.get('mandatees').sortBy('priority');
  }),

  hasActivity: computed('agendaActivities', 'agendaActivities.@each', async function() {
    const activities = await this.get('agendaActivities');
    if (activities && activities.length > 0) {
      return true;
    }
    return false;
  }),

  agendaitemsOnDesignAgendaToEdit: computed('id', 'agendaActivities', async function() {
    return await this.store.query('agendaitem', {
      filter: {
        'agenda-activity': {
          subcase: {
            id: this.get('id'),
          },
        },
        agenda: {
          status: {
            id: '2735d084-63d1-499f-86f4-9b69eb33727f',
          },
        },
      },
    });
  }),

  latestMeeting: alias('requestedForMeeting'),

  latestAgenda: computed('latestMeeting', async function() {
    const lastMeeting = await this.get('latestMeeting');
    return await lastMeeting.get('latestAgenda');
  }),

  latestAgendaItem: computed('latestActivity.agendaitems.@each', 'agendaActivities.@each.agendaitems', async function() {
    const latestActivity = await this.get('latestActivity');
    if (latestActivity) {
      const latestItem = await latestActivity.get('latestAgendaitem');
      return latestItem;
    }
    return null;
  }),

  onAgendaInfo: computed('latestMeeting', async function() {
    const latestMeeting = await this.get('latestMeeting');
    return latestMeeting.plannedStart;
  }),

  approved: computed('decisions', function() {
    return PromiseObject.create({
      promise: this.get('decisions').then((decisions) => {
        const approvedDecisions = decisions.map((decision) => decision.get('approved'));
        if (approvedDecisions && approvedDecisions.length === 0) {
          return false;
        }
        const foundNonApprovedDecision = approvedDecisions.includes(false);
        return !foundNonApprovedDecision;
      }),
    });
  }),

  subcasesFromCase: computed('case.subcases.@each', function() {
    return PromiseArray.create({
      //  We want to sort descending on date the subcase was concluded.
      //  In practice, sorting on created will be close
      promise: this.get('case').then((caze) => caze.get('subcases')
        .then((subcases) => subcases.filter((subcase) => subcase.get('id') !== this.id).sort((documentA, documentB) => documentB.created - documentA.created))),
    });
  }),

  remarkType: computed('showAsRemark', function() {
    let id = '';
    if (this.showAsRemark) {
      id = CONFIG.remarkId;
    } else {
      id = CONFIG.notaCaseTypeID;
    }
    return this.store.findRecord('case-type', id);
  }),
});
