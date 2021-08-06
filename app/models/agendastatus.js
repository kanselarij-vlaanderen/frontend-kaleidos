import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  isDesignAgenda: computed('uri', function() {
    return this.uri === CONSTANTS.AGENDA_STATUSSES.DESIGN;
  }),
  isFinal: computed('uri', function() {
    return this.uri === CONSTANTS.AGENDA_STATUSSES.CLOSED;
  }),
  isApproved: computed('uri', function() {
    return this.uri === CONSTANTS.AGENDA_STATUSSES.APPROVED;
  }),
});
