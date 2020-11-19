import Component from '@ember/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';

export default Component.extend({
  store: service(),
  subcasesService: service(),
  toaster: service(),
  isResigning: false,
  isEditing: false,
  selectedStartDate: null,
  selectedEndDate: null,
  mandateesUpdated: null,
  @tracked showVerificationPopup: null,
  mandateeService: service(),

  async didInsertElement() {
    const today = moment();
    this.showVerificationPopup = await this.mandateeService.mandateeIsCompetentOnFutureAgendaitem(today, this.mandateeToEdit.id);
  },

  actions: {
    closeModal() {
      this.closeModal();
    },

    mandateesUpdated() {
      this.mandateesUpdated();
    },

    selectMandatee(mandatee) {
      this.set('mandateeToEdit', mandatee);
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    toggleIsResigning() {
      this.toggleProperty('isResigning');
    },

    selectEndDate(date) {
      this.set('selectedEndDate', date);
    },

    selectNewStartDate(date) {
      this.set('selectedStartDate', date);
    },

    personSelected(person) {
      this.set('selectedPerson', person);
    },

    resignMandatee(mandateeToEdit) {
      this.set('mandateeToResign', mandateeToEdit);
      this.toggleProperty('isResigning');
    },

    async saveResignation() {
      const selectedPerson = this.get('selectedPerson');
      if (!selectedPerson) {
        const message = 'Het mandaat wordt beëindigd, maar er is geen nieuwe mandataris gekozen.';
        const title = 'Opgelet!';
        this.toaster.warning(message, title);
      }
      this.set('isLoading', true);
      const oldMandatee = this.get('mandateeToEdit');
      const domains = await oldMandatee.get('governmentDomains');
      const holds = await oldMandatee.get('holds');

      oldMandatee.set('end', this.get('selectedEndDate') || moment().utc()
        .toDate());
      oldMandatee.save().then(() => {
        if (!selectedPerson) {
          return;
        }
        const newMandatee = this.store.createRecord('mandatee', {
          title: oldMandatee.get('title'),
          start: this.get('selectedStartDate') || moment().utc()
            .toDate(),
          end: moment()
            .add(5, 'years')
            .utc()
            .toDate(),
          person: selectedPerson,
          holds,
          governmentDomains: domains,
          priority: oldMandatee.get('priority'),
        });
        return newMandatee.save().then(() => {
          this.get('subcasesService').setNewMandateeToRelatedOpenSubcases(oldMandatee.get('id'), newMandatee.get('id'));
        });
      })
        .then(() => {
          this.mandateesUpdated();
          this.set('isLoading', false);
          this.closeModal();
        });
    },
    close() {
      this.showVerificationPopup = false;
    },
  },
});
