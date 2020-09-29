import Controller from '@ember/controller';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  intl: inject(),
  queryParams: ['definite'],

  meeting: alias('model.currentAgenda.createdFor'),
  title: computed('meeting', function() {
    const date = this.get('meeting.plannedStart');
    const kindLabel = this.get('meeting.kindToShow.altLabel');
    return `${this.intl.t('decisions-of-kind', {
      kind: kindLabel,
    })} ${moment(date).format('dddd DD-MM-YYYY')}`;
  }),

  documentTitle: computed('meeting', 'definite', function() {
    const date = this.get('meeting.plannedStart');
    const kindLabel = this.get('meeting.kindToShow.altLabel');
    let prefix = '';

    if (this.definite === 'false') {
      prefix = 'Klad ';
    }
    return `${prefix}${this.intl.t('decisions-of-kind', {
      kind: kindLabel,
    })} ${moment(date).format('DD-MM-YYYY')}`;
  }),
});
