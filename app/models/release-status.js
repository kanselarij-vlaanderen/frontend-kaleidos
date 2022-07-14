import Model, { attr } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class ReleaseStatus extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') position;

  get isPlanned() {
    return this.uri === CONSTANTS.RELEASE_STATUSES.PLANNED;
  }

  get isConfirmed() {
    return this.uri === CONSTANTS.RELEASE_STATUSES.CONFIRMED;
  }

  get isReleased() {
    return this.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
  }
}
