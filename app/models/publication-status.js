import Model, {
  attr, hasMany
} from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationStatus extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') position;
  @hasMany('publication-flow') publicaties;

  get isPending() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PENDING;
  }
  get isPublished() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PUBLISHED;
  }
  get isWithdrawn() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.WITHDRAWN;
  }
  get isPaused() {
    return this.uri === CONSTANTS.PUBLICATION_STATUSES.PAUSED;
  }
}
