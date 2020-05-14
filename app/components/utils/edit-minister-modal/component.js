import Component from '@ember/component';
import { createMandateeRow, selectDomain, selectField } from '../../../utils/manage-minister-util';

export default Component.extend({
    selectedMandatee: null,

    actions: {
      async saveChanges() {
        this.set('isLoading', true);

        const { selectedMandatee, rowToShow } = this;
        const newMinisterRow = await createMandateeRow(selectedMandatee,rowToShow);
        this.saveChanges(selectedMandatee, newMinisterRow);
        this.set('isLoading', false);
        this.cancel();
      },

      async selectField(domain, value) {
        const foundDomain = await this.get('rowToShow.domains');
        await selectField(foundDomain,domain, value);
      },

      async selectDomain(domain, value) {
        const rowToShowFields = await this.get('rowToShow.fields');
        await selectDomain(rowToShowFields,domain,value);
      },

      cancel() {
        this.cancel();
      }
    }
  });
