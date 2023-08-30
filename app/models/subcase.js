import { belongsTo, hasMany, attr } from '@ember-data/model';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

export default class Subcase extends ModelWithModifier {
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr shortTitle;
  @attr title;
  @attr('boolean') confidential; // this is now "limited access"
  @attr subcaseName;

  get modelName() {
    return this.constructor.modelName;
  }

  @belongsTo('subcase-type', { inverse: 'subcases', async: true }) type;
  @belongsTo('decisionmaking-flow', { inverse: 'subcases', async: true })
  decisionmakingFlow;
  @belongsTo('mandatee', { inverse: 'requestedSubcases', async: true })
  requestedBy;
  @belongsTo('concept', { inverse: null, async: true }) agendaItemType;

  @hasMany('agenda-activity', { inverse: 'subcase', async: true })
  agendaActivities;
  @hasMany('submission-activity', { inverse: 'subcase', async: true })
  submissionActivities;
  @hasMany('piece', { inverse: null, async: true, polymorphic: true })
  linkedPieces; // Actual inverse is linkedSubcase(s), but unsure if it should be a one-to-many or many-to-many yet
  @hasMany('mandatee', { inverse: 'subcases', async: true }) mandatees;
  @hasMany('decision-activity', { inverse: 'subcase', async: true })
  decisionActivities;
  @hasMany('concept', { inverse: null, async: true }) governmentAreas;
}
