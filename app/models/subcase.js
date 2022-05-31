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
  case: belongsTo('case'),
  requestedForMeeting: belongsTo('meeting', {
    inverse: null,
  }),
  requestedBy: belongsTo('mandatee', {
    inverse: null,
  }),

  // TODO don't use this computed, used in 5 places, make util?
  approved: computed('treatments', 'treatments.@each.decisionResultCode', 'requestedForMeeting', async function() {
    const meeting = await this.get('requestedForMeeting');
    if (meeting?.isFinal) {
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
