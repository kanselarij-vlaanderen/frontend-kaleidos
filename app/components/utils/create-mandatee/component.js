import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
  store: inject(),
  selectedPerson: null,
  mandateesUpdated: null,
  today: moment()
    .utc()
    .toDate(),
  title: null,

  actions: {
    personSelected(person) {
      this.set('selectedPerson', person);
    },

    selectStartDate(val) {
      this.set('startDate', val);
    },

    chooseDomain(domains) {
      this.set('selectedDomains', domains);
    },

    closeModal() {
      this.closeModal();
    },

    async createMandatee() {
      this.set('isLoading', true);
      const { nickName, title, selectedDomains } = this;
      const person = await this.get('selectedPerson');
      const newMandatee = this.store.createRecord('mandatee', {
        title,
        nickName,
        person,
        governmentDomains: selectedDomains,
        start: moment(this.get('startDate'))
          .utc()
          .toDate(),
        end: moment().add(5,'years').toDate()
      });
      newMandatee.save().then(newMandatee => {
        this.model.addObject(newMandatee);
        this.set('isLoading', false);
        this.clearValues();
        this.closeModal();
        this.mandateesUpdated();
      });
    }
  },

  clearValues() {
    this.set('selectedPerson', null);
    this.set('title', null);
    this.set('startDate', null);
    this.set('endDate', null);
    this.set('nickName', null);
    this.set('selectedDomains', []);
  }
});
