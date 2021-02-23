import Component from '@ember/component';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { cached } from 'frontend-kaleidos/decorators/cached';

export default Component.extend({
  store: inject(),
  mandateeService: inject(),

  mandateesUpdated: null,
  @tracked showVerificationPopup: false,

  startDate: cached('mandateeToEdit.start'), // TODO in class syntax use as a decorator instead
  endDate: cached('mandateeToEdit.end'), // TODO in class syntax use as a decorator instead
  iseCodes: cached('mandateeToEdit.iseCodes'), // TODO in class syntax use as a decorator instead
  title: cached('mandateeToEdit.title'), // TODO in class syntax use as a decorator instead
  shortTitle: cached('mandateeToEdit.shortTitle'), // TODO in class syntax use as a decorator instead
  nickName: cached('mandateeToEdit.nickName'), // TODO in class syntax use as a decorator instead

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
