import { belongsTo, hasMany, attr } from '@ember-data/model';
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
    serialize: false,
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

  // TODO don't use this computed, used in 1 controller
  latestActivity: computed('agendaActivities', 'agendaActivities.[]', async function() {
    const activities = await this.get('agendaActivities').then((activities) => activities.sortBy('startDate'));
    if (activities && activities.length > 0) {
      return activities.get('lastObject');
    }
    return null;
  }),

  // TODO don't use this computed, refactor subcase-description-view.hbs && subcase-item.hbs
  // eslint-disable-next-line ember/use-brace-expansion
  phases: computed('agendaActivities.agendaitems', 'agendaActivities.agendaitems.[]', 'latestActivity.agendaitems.@each.retracted', 'approved', async function() {
    const activities = await this.get('agendaActivities');
    if (activities && activities.length > 0) {
      const phases = await this.get('subcasesService').getSubcasePhases(this);
      return phases;
    }
    return null;
  }),

  // TODO don't use this computed, use getter instead, used in subcase-item.hbs
  nameToShow: computed('subcaseName', function() {
    const {
      subcaseName, title, shortTitle,
    } = this;
    if (subcaseName) {
      return `${this.intl.t('in-function-of')} ${subcaseName}`;
    } if (shortTitle) {
      return shortTitle;
    } if (title) {
      return title;
    }
    return 'No name found.';
  }),

  // TODO don't use this computed, no more references currently?
  sortedMandatees: computed('mandatees.[]', function() {
    return this.get('mandatees').sortBy('priority');
  }),

  // TODO don't use this computed, refactor subcase-header.js
  hasActivity: computed('agendaActivities', 'agendaActivities.[]', async function() {
    const activities = await this.get('agendaActivities');
    if (activities && activities.length > 0) {
      return true;
    }
    return false;
  }),

  // TODO don't use this computed, refactor agendaitem-utils.js
  agendaitemsOnDesignAgendaToEdit: computed('id', 'agendaActivities', async function() {
    return await this.store.query('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.get('id'),
      'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
    });
  }),

  // TODO don't use this alias, only used in this model
  latestMeeting: alias('requestedForMeeting'),

  // TODO don't use this computed, seems to be used somewhere, got error here in a very specific chain of events
  // error hit when creating a subcase with no proposable agenda, making an agenda in other tab and then using the propose datepicker feature, no refreshes in between
  latestAgenda: computed('latestMeeting', 'latestMeeting.latestAgenda', async function() {
    const lastMeeting = await this.get('latestMeeting');
    return await lastMeeting.get('latestAgenda');
  }),

  // TODO don't use this computed, no more references currently?
  latestAgendaitem: computed('latestActivity.agendaitems.[]', 'agendaActivities.@each.agendaitems', async function() {
    const latestActivity = await this.get('latestActivity');
    if (latestActivity) {
      await latestActivity.hasMany('agendaitems').reload();
      const latestAgendaitem = await latestActivity.get('latestAgendaitem');
      return latestAgendaitem;
    }
    return null;
  }),

  // TODO don't use this computed, refactor subcase-item.hbs
  onAgendaInfo: computed('latestMeeting', async function() {
    const latestMeeting = await this.get('latestMeeting');
    if (latestMeeting) {
      return latestMeeting.plannedStart;
    }
    return null;
  }),

  // TODO don't use this computed, used in 5 places, make util?
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

});
