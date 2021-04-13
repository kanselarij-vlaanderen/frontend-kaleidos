import Model, {
  attr, hasMany
} from '@ember-data/model';
import CONFIG from 'frontend-kaleidos/utils/config';
export default class UrgencyLevel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') position;
  @hasMany('publication-flow') publications;

  get isUrgent() {
    return this.uri === CONFIG.URGENCY_LEVELS.spoedprocedure;
  }
}
