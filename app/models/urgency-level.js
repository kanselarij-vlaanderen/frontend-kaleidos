import Model, {
  attr, hasMany
} from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';
export default class UrgencyLevel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') position;
  @hasMany('publication-flow') publications;
  get isUrgent() {
    return this.uri === CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE;
  }
}
