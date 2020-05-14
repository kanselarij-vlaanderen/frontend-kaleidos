import Component from '@ember/component';
import EmberObject from '@ember/object';
import {
  refreshData
} from '../../../utils/manage-minister-util';
export default Component.extend({

  rowToShow: null,
  selectedMandatee: null,

  actions: {

    async saveChanges() {
      this.set('isLoading', true);

      const { selectedMandatee, rowToShow } = this;
      const fields = rowToShow.get('fields');
      const domains = rowToShow.get('domains');

      const selectedDomains = [...new Set(domains.filter((domain) => domain.selected))];
      const selectedFields = fields.filter((field) => field.selected);
      const allIseCodes = await selectedMandatee.get('iseCodes');
      let filteredIseCodes = (await Promise.all(allIseCodes.map((iseCode) => {
        const foundField = (selectedFields.find((field) => field.get('id') === iseCode.get('field.id')));
        if (foundField) {
          return iseCode;
        }
      }))).filter((item) => item);

      const newRow = EmberObject.create({
        mandatee: selectedMandatee,
        mandateePriority: selectedMandatee.get('priority'),
        fields: selectedFields,
        domains: selectedDomains,
        iseCodes: filteredIseCodes
      });

      if (rowToShow.get('isSubmitter')) {
        newRow.set('isSubmitter', true);
      }

      this.saveChanges(selectedMandatee, newRow);
      this.set('isLoading', false);
      this.cancel();
    },

    async selectField(domain, value) {
      const foundDomain = this.get('rowToShow.domains').find((item) => item.id == domain.id);
      const fields = await domain.get('governmentFields');
      const selectedFields = fields.filter((field) => field.selected);

      if (value) {
        foundDomain.set('selected', value);
      } else {
        if (selectedFields.length === 1) {
          foundDomain.set('selected', value);
        }
      }
    },

    async mandateeSelected(mandatee) {
      this.set('selectedMandatee', mandatee);
      this.set('isLoading', true);
      const rowsToShow = await refreshData(mandatee,await this.get('mandateeRows'));
      this.set('rowToShow',rowsToShow);
      this.set('isLoading', false);
    },

    async selectDomain(domain, value) {
      const fields = await this.get('rowToShow.fields').filter((field) => field.get('domain.id') === domain.id);
      fields.map((field) => field.set('selected', value));
    },

    cancel() {
      this.cancel();
    }
  }

});
