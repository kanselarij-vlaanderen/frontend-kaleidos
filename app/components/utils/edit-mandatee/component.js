import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';

export default Component.extend({
  store: inject(),
  mandateeService: inject(),
  item: computed('mandateeToEdit', function () {
    return this.get('mandateeToEdit');
  }),

  mandateesUpdated: null,
  @tracked showVerificationPopup: false,
  startDate: getCachedProperty('start'),
  endDate: getCachedProperty('end'),
  iseCodes: getCachedProperty('iseCodes'),
  title: getCachedProperty('title'),
  shortTitle: getCachedProperty('shortTitle'),
  nickName: getCachedProperty('nickName'),

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
  },

  actions: {
    selectStartDate(val) {
      this.set('startDate', val);
    },
    selectEndDate(val) {
      this.set('endDate', val);
    },

    chooseIseCodes(iseCodes) {
      this.set('iseCodes', iseCodes);
    },

    closeModal() {
      this.closeModal();
    },

    async chooseDomain(domains) {
      this.set('selectedDomains', domains);
      this.chooseDomain(domains);
    },

    personSelected(person) {
      this.set('mandateeToEdit.person', person);
    },

    verify() {
      this.showVerificationPopup = !this.showVerificationPopup;
    },

    cancel() {
      this.showVerificationPopup = false;
    },

    keyDown: function (event) {
      if (event.key === 'Escape') {
        this.cancel();
      }
    },

    async triggerPopUp(mandateeToEdit) {
      this.showVerificationPopup = await this.mandateeService.mandateeIsCompetentOnFutureAgendaItem(mandateeToEdit.end, mandateeToEdit.id);
      if (!this.showVerificationPopup) {
        this.saveChanges();
      }
    },
    saveChanges() {
      this.saveChanges();
    }
  },
});
