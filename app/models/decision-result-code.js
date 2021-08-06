import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  priority: attr('number'),
  isPostponed: computed('uri', function() {
    return this.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD;
  }),
});
