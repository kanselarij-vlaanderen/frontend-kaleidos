import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { alias } from '@ember/object/computed';
import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import {
  sortDocumentContainers, getPropertyLength
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
  showAsRemark: attr('boolean'),
  confidential: attr('boolean'),
  isArchived: attr('boolean'),
  subcaseName: attr('string'),

  iseCodes: hasMany('ise-code'),
  agendaActivities: hasMany('agenda-activity', {
    inverse: null,
  }),
  submissionActivities: hasMany('submission-activity', {
    serialize: true,
  }),
  linkedPieces: hasMany('piece'),
  mandatees: hasMany('mandatee'),
  treatments: hasMany('agenda-item-treatment', {
    inverse: null,
  }),

  publicationActivities: hasMany('activity', {
    inverse: null,
  }),

  type: belongsTo('subcase-type'),
  case: belongsTo('case', {
    inverse: null,
  }),
  requestedForMeeting: belongsTo('meeting', {
    inverse: null,
  }),
  requestedBy: belongsTo('mandatee', {
    inverse: null,
  }),
  accessLevel: belongsTo('access-level'),


  publicationFlow: belongsTo('publication-flow', {
    inverse: null,
  }),

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
            id: CONFIG.agendaStatusDesignAgenda.id,
          },
        },
      },
    });
  }),

  latestMeeting: alias('requestedForMeeting'),

  latestAgenda: computed('latestMeeting', 'latestMeeting.latestAgenda', async function() {
    const lastMeeting = await this.get('latestMeeting');
    return await lastMeeting.get('latestAgenda');
  }),

  latestAgendaitem: computed('latestActivity.agendaitems.@each', 'agendaActivities.@each.agendaitems', async function() {
    const latestActivity = await this.get('latestActivity');
    if (latestActivity) {
      const latestAgendaitem = await latestActivity.get('latestAgendaitem');
      return latestAgendaitem;
    }
    return null;
  }),

  onAgendaInfo: computed('latestMeeting', async function() {
    const latestMeeting = await this.get('latestMeeting');
    return latestMeeting.plannedStart;
  }),

  approved: computed('treatments', 'treatments.@each.decisionResultCode', function() {
    return PromiseObject.create({
      promise: this.get('treatments').then((treatments) => {
        if (treatments && treatments.get('length') > 0) {
          const treatmentIds = treatments.map((treatment) => treatment.get('id')).join(',');
          const drcIds = ['56312c4b-9d2a-4735-b0b1-2ff14bb524fd', '9f342a88-9485-4a83-87d9-245ed4b504bf'].join(',');
          return this.store.query('agenda-item-treatment', {
            filter: {
              id: treatmentIds,
              'decision-result-code': {
                id: drcIds,
              },
            },
            include: 'decision-result-code',
          }).then((treatments) => treatments.get('firstObject'));
        }
        return null;
      }),
    });
  }),

  subcasesFromCase: computed('case.subcases.@each', function() {
    return PromiseArray.create({
      //  We want to sort descending on date the subcase was concluded.
      //  In practice, sorting on created will be close
      promise: this.get('case').then((caze) => caze.get('subcases')
        .then((subcases) => subcases.filter((subcase) => subcase.get('id') !== this.id).sort((subcaseA, subcaseB) => subcaseB.created - subcaseA.created))),
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
