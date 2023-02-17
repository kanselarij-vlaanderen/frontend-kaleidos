import { belongsTo, hasMany, attr } from '@ember-data/model';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

export default class Subcase extends ModelWithModifier {
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr shortTitle;
  @attr title;
  @attr('boolean') confidential; // this is now "limited access"
  @attr('boolean') isArchived;
  @attr subcaseName;

  get modelName() {
    return this.constructor.modelName;
  }

  @belongsTo('subcase-type') type;
  @belongsTo('decisionmaking-flow') decisionmakingFlow;
  @belongsTo('mandatee', { inverse: 'requestedSubcases' }) requestedBy;
  @belongsTo('concept') agendaItemType;

  // inverse: null or serialize: false is used for possible concurrency issues when saving without reloading possible stale relations.
  @hasMany('agenda-activity', { serialize: false })
  agendaActivities;
  @hasMany('submission-activity', { serialize: false }) submissionActivities;
  @hasMany('piece') linkedPieces;
  @hasMany('mandatee', { inverse: 'subcases' }) mandatees;
  @hasMany('decision-activity', { serialize: false })
  decisionActivities;
  @hasMany('concept') governmentAreas;
}
