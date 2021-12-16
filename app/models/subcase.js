import { belongsTo, hasMany, attr } from '@ember-data/model';
import { PromiseArray } from '@ember-data/store/-private';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { alias } from '@ember/object/computed';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
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

  latestActivity: computed('agendaActivities', 'agendaActivities.[]', async function() {
    const activities = await this.get('agendaActivities').then((activities) => activities.sortBy('startDate'));
    if (activities && activities.length > 0) {
      return activities.get('lastObject');
    }
    return null;
  }),

  // eslint-disable-next-line ember/use-brace-expansion
  phases: computed('agendaActivities.agendaitems', 'agendaActivities.agendaitems.[]', 'latestActivity.agendaitems.@each.retracted', 'approved', async function() {
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

  sortedMandatees: computed('mandatees.[]', function() {
    return this.get('mandatees').sortBy('priority');
  }),

  hasActivity: computed('agendaActivities', 'agendaActivities.[]', async function() {
    const activities = await this.get('agendaActivities');
    if (activities && activities.length > 0) {
      return true;
    }
    return false;
  }),

  agendaitemsOnDesignAgendaToEdit: computed('id', 'agendaActivities', async function() {
    return await this.store.query('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.get('id'),
      'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
    });
  }),

  latestMeeting: alias('requestedForMeeting'),

  latestAgenda: computed('latestMeeting', 'latestMeeting.latestAgenda', async function() {
    const lastMeeting = await this.get('latestMeeting');
    return await lastMeeting.get('latestAgenda');
  }),

  latestAgendaitem: computed('latestActivity.agendaitems.[]', 'agendaActivities.@each.agendaitems', async function() {
    const latestActivity = await this.get('latestActivity');
    if (latestActivity) {
      await latestActivity.hasMany('agendaitems').reload();
      const latestAgendaitem = await latestActivity.get('latestAgendaitem');
      return latestAgendaitem;
    }
    return null;
  }),

  onAgendaInfo: computed('latestMeeting', async function() {
    const latestMeeting = await this.get('latestMeeting');
    if (latestMeeting) {
      return latestMeeting.plannedStart;
    }
    return null;
  }),

  approved: computed('treatments', 'treatments.@each.decisionResultCode', 'requestedForMeeting', async function() {
    const meeting = await this.get('requestedForMeeting');
    if (meeting.isFinal) {
      const treatments = await this.get('treatments');
      if (treatments && treatments.get('length') > 0) {
        const treatmentIds = treatments.map((treatment) => treatment.get('id')).join(',');
        const approvedTreatment = await this.store.queryOne('agenda-item-treatment', {
          'filter[id]': treatmentIds,
          'filter[decision-result-code][:uri:]': CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD,
        });
        const acknowledgedTreatment = await this.store.queryOne('agenda-item-treatment', {
          'filter[id]': treatmentIds,
          'filter[decision-result-code][:uri:]': CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME,
        });
        return !!approvedTreatment || !!acknowledgedTreatment;
      }
    }
    return false;
  }),

  subcasesFromCase: computed('case.subcases.[]', 'id', function() {
    return PromiseArray.create({
      //  We want to sort descending on date the subcase was concluded.
      //  In practice, sorting on created will be close
      promise: this.get('case').then((caze) => caze.get('subcases')
        .then((subcases) => subcases.filter((subcase) => subcase.get('id') !== this.id).sort((subcaseA, subcaseB) => subcaseB.created - subcaseA.created))),
    });
  }),

  remarkType: computed('showAsRemark', function() {
    let uri = '';
    if (this.showAsRemark) {
      uri = CONSTANTS.CASE_TYPES.REMARK;
    } else {
      uri = CONSTANTS.CASE_TYPES.NOTA;
    }
    return this.store.findRecordByUri('case-type', uri);
  }),
});
