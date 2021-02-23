import DS from 'ember-data';
import { computed } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';

const {
  Model, attr,
} = DS;

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  priority: attr('number'),
  isPostponed: computed('uri', function() {
    return this.uri === CONFIG.DECISION_RESULT_CODE_URIS.UITGESTELD;
  }),
});
