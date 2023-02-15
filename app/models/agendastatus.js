import Model, { attr } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaStatus extends Model {
  @attr('string') uri;
  @attr('string') label;

  get isDesignAgenda() {
    return this.uri === CONSTANTS.AGENDA_STATUSSES.DESIGN;
  }

  get isApproved() {
    return this.uri === CONSTANTS.AGENDA_STATUSSES.APPROVED;
  }
}
