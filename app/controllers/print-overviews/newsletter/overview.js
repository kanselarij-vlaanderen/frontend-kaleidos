import Controller from '@ember/controller';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';

export default Controller.extend({
  intl: inject(),
  queryParams: ['definite'],
  page: 0,
  size: 100,

  title: computed('model.meeting', async function() {
    const date = await this.get('model.meeting.plannedStart');
    return `${this.intl.t(
      `newsletter-overview-pdf-name`
    )} van ${moment(date).format('dddd DD-MM-YYYY')}`;
  }),

  links: computed('model.links', function() {
    return this.get('model.links');
  }),

  nbOfItems: computed('model.amountShowed', function() {
    return this.get('model.amountShowed');
  }),

  total: computed('model.amountOfItems', function() {
    return this.get('model.amountOfItems');
  }),

  documentTitle: computed('model.currentAgenda.createdFor', 'definite', function() {
    const date = this.get('model.currentAgenda.createdFor.plannedStart');
    let prefix = '';

    if (this.definite == 'false') {
      prefix = 'Klad ';
    }
    return `${prefix}${this.intl.t('newsletter-overview-pdf-name')} ${moment(date).format('DD-MM-YYYY')}`;
  }),
});
