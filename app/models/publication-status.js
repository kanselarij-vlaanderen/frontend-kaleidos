import Model, {
  attr, hasMany
} from '@ember-data/model';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class PublicationStatus extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') position;
  @hasMany('publication-flow') publicaties;

  get isPending() {
    return this.uri === CONFIG.PUBLICATION_STATUSES.pending.uri;
  }
  get isPublished() {
    return this.uri === CONFIG.PUBLICATION_STATUSES.published.uri;
  }
  get isWithdrawn() {
    return this.uri === CONFIG.PUBLICATION_STATUSES.withdrawn.uri;
  }
  get isPaused() {
    return this.uri === CONFIG.PUBLICATION_STATUSES.paused.uri;
  }
}
