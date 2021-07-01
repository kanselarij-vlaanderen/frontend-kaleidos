import DS from 'ember-data';
import { computed } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const {
  Model, attr,
} = DS;

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  priority: attr('number'),
  isPostponed: computed('uri', function() {
    return this.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD;
  }),
});
