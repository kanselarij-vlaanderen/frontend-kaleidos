import Controller from '@ember/controller';
import { computed } from '@ember/object';
import moment from 'moment';

import { inject } from '@ember/service';
export default Controller.extend({
  intl: inject(),
  queryParams: ['definite'],

  title: computed('model.currentAgenda.createdFor', 'definite', function() {
    const date = this.get('model.currentAgenda.createdFor.plannedStart');
    return `${this.intl.t('notes-of-session')} ${moment(date).format('dddd DD-MM-YYYY')}`;
  }),

  documentTitle: computed('model.currentAgenda.createdFor', 'definite', function() {
    const date = this.get('model.currentAgenda.createdFor.plannedStart');
    let prefix = '';

    if (this.definite == 'false') {
      prefix = 'Klad ';
    }
    return `${prefix}${this.intl.t('agenda-notes')} ${moment(date).format('DD-MM-YYYY')}`;
  })
});
