import { belongsTo, hasMany, attr } from '@ember-data/model';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

export default class Subcase extends ModelWithModifier {
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr shortTitle;
  @attr title;
  @attr('boolean') showAsRemark;
  @attr('boolean') confidential;
  @attr('boolean') isArchived;
  @attr subcaseName;

  get modelName() {
    return this.constructor.modelName;
  }

  @belongsTo('subcase-type') type;
  @belongsTo('case') case;
  @belongsTo('meeting', { inverse: null }) requestedForMeeting;
  @belongsTo('mandatee', { inverse: null }) requestedBy;

  @hasMany('agenda-activity', { inverse: null }) agendaActivities;
  @hasMany('submission-activity', { serialize: false }) submissionActivities;
  @hasMany('piece') linkedPieces;
  @hasMany('mandatee') mandatees;
  @hasMany('decision-activity', { inverse: null }) decisionActivities; // TODO: document why "inverse: null" is here or remove
}
