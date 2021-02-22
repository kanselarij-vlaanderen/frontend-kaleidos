import DS from 'ember-data';
import { computed } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';

const {
  Model, attr,
} = DS;

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  isDesignAgenda: computed('uri', function() {
    return this.uri === CONFIG.agendaStatusDesignAgenda.uri;
  }),
  isFinal: computed('uri', function() {
    return this.uri === CONFIG.agendaStatusClosed.uri;
  }),
  isApproved: computed('uri', function() {
    return this.uri === CONFIG.agendaStatusApproved.uri;
  }),
});
