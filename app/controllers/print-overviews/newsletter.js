import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Controller.extend({
  intl: inject(),

  title: computed('model.createdFor', function() {
    const date = this.get('model.createdFor.plannedStart');
    return `${this.intl.t(
      `newsletter-overview-pdf-name`
    )} ${moment(date).format('dddd DD-MM-YYYY')}`;
  }),
});
