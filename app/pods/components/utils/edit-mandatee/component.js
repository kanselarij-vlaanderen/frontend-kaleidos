import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { cached } from 'fe-redpencil/decorators/cached';

export default Component.extend({
  store: inject(),
  mandateeService: inject(),
  item: computed('mandateeToEdit', function() {
    return this.get('mandateeToEdit');
  }),

  mandateesUpdated: null,
  @tracked showVerificationPopup: false,
  startDate: cached('item.start'), // TODO in class syntax use as a decorator instead
  endDate: cached('item.end'), // TODO in class syntax use as a decorator instead
  iseCodes: cached('item.iseCodes'), // TODO in class syntax use as a decorator instead
  title: cached('item.title'), // TODO in class syntax use as a decorator instead
  shortTitle: cached('item.shortTitle'), // TODO in class syntax use as a decorator instead
  nickName: cached('item.nickName'), // TODO in class syntax use as a decorator instead

  async saveChanges() {
    this.set('isLoading', true);
    const {
      startDate, endDate, title, shortTitle, mandateeToEdit, iseCodes, nickName,
    } = this;
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

    keyDown(event) {
      if (event.key === 'Escape') {
        this.cancel();
      }
    },

    async triggerPopUp(mandateeToEdit) {
      this.showVerificationPopup = await this.mandateeService.mandateeIsCompetentOnFutureAgendaitem(mandateeToEdit.end, mandateeToEdit.id);
      if (!this.showVerificationPopup) {
        this.saveChanges();
      }
    },
    saveChanges() {
      this.saveChanges();
    },
  },
});
