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


  links: computed('model.links', function() {
    return this.get('model.links');
  }),

  nbOfItems: computed('model.amountShowed', function() {
    return this.get('model.amountShowed');
  }),

  total: computed('model.amountOfItems', function() {
    return this.get('model.amountOfItems');
  }),

  documentTitle: computed('model.currentAgenda.createdFor', 'showDraft', function() {
    const date = this.get('model.currentAgenda.createdFor.plannedStart');
    let prefix = '';

    if (this.showDraft) {
      prefix = 'Klad ';
    }
    return `${prefix}${this.intl.t('newsletter-overview-pdf-name')} ${moment(date).format('DD-MM-YYYY')}`;
  }),
});
