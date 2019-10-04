import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend({
  store: inject(),

  item: computed('mandateeToEdit', function() {
    return this.get('mandateeToEdit');
  }),

  mandateesUpdated: null,

  startDate: getCachedProperty('start'),
  endDate: getCachedProperty('end'),
  iseCodes: getCachedProperty('iseCodes'),
  title: getCachedProperty('title'),
  shortTitle: getCachedProperty('shortTitle'),
  nickName: getCachedProperty('nickName'),

  actions: {
    selectStartDate(val) {
      this.set('startDate', val);
    },
    selectEndDate(val) {
      this.set('endDate', val);
    },

    chooseDomain(iseCodes) {
      this.set('iseCodes', iseCodes);
    },

    closeModal() {
      this.closeModal();
    },

    async saveChanges() {
      this.set('isLoading', true);
      const { startDate, endDate, title, shortTitle, mandateeToEdit, iseCodes, nickName } = this;
      const mandatee = await this.store.findRecord('mandatee', mandateeToEdit.get('id'));
      mandatee.set('end', endDate);
      mandatee.set('title', title);
      mandatee.set('shortTitle', shortTitle);
      mandatee.set('iseCodes', iseCodes);
      mandatee.set('start', startDate);
      mandatee.set('nickName', nickName);
      mandatee.save().then(() => {
        this.set('isLoading', false);
        this.closeModal();
        this.mandateesUpdated();
      });
    }
  }
});
