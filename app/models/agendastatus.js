import DS from 'ember-data';
import { computed } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const {
  Model, attr,
} = DS;

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
