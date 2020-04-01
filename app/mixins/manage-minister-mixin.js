/* eslint-disable ember/no-new-mixins */
import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';

export default Mixin.create({
  store: inject(),
  rowToShow: null,
  selectedMandatee: null,

  async refreshData(mandatee) {
    this.set('isLoading', true);

    const iseCodes = (await mandatee.get('iseCodes')).filter((item) => item);
    const fields = (await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')))).filter((item) => item);
    const domains = await Promise.all(fields.map((field) => field.get('domain')));

    const rowToShow = EmberObject.create({
      domains: [...new Set(domains)],
      fields: [...new Set(fields)]
    });
    rowToShow.get('domains').map((domain) => domain.set('selected', false));
    rowToShow.get('fields').map((domain) => domain.set('selected', false));
    const mandateeRows = await this.get('mandateeRows');

    if (!mandateeRows) {
      rowToShow.set('isSubmitter', true);
    }
    this.set('isLoading', false);
    return rowToShow;
  },

  actions: {
    async mandateeSelected(mandatee) {
      this.set('selectedMandatee', mandatee);
      this.set('rowToShow', await this.refreshData(mandatee));
    },

    async selectDomain(domain, value) {
      const fields = await this.get('rowToShow.fields').filter((field) => field.get('domain.id') === domain.id);
      fields.map((field) => field.set('selected', value));
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

    cancel() {
      this.cancel();
    },
  }
});
