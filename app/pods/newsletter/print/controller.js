import Controller from '@ember/controller';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';

export default Controller.extend({
  intl: inject(),
  queryParams: {
    showDraft: {
      type: 'boolean',
    },
  },
  page: 0,
  size: 100,


});
