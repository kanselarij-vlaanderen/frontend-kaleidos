import Component from '@ember/component';
import {
  refreshData,
  selectDomain,
  selectField,
  prepareMandateeRowAfterEdit
} from 'frontend-kaleidos/utils/manage-minister-util';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default Component.extend({
  intl: inject(),
  rowToShow: null,
  selectedMandatee: null,
  @tracked title: '',

  willRender() {
    if (this.isAddingMinister) {
      this.title = this.intl.t('add-minister');
    } else {
      this.title = this.intl.t('edit-minister');
    }
  },

  actions: {

    async saveChanges() {
      this.set('isLoading', true);
      const {
        selectedMandatee, rowToShow,
      } = this;
      const newMinisterRow = await prepareMandateeRowAfterEdit(selectedMandatee, rowToShow);
      this.saveChanges(selectedMandatee, newMinisterRow);
      this.set('isLoading', false);
      this.cancel();
    },

    async selectField(domain, value) {
      const foundDomain = await this.get('rowToShow.domains');
      await selectField(foundDomain, domain, value);
    },

    async mandateeSelected(mandatee) {
      this.set('selectedMandatee', mandatee);
      this.set('isLoading', true);
      const rowsToShow = await refreshData(mandatee, await this.get('mandateeRows'));
      this.set('rowToShow', rowsToShow);
      this.set('isLoading', false);
    },

    async selectDomain(domain, value) {
      const rowToShowFields = await this.get('rowToShow.fields');
      await selectDomain(rowToShowFields, domain, value);
    },

    cancel() {
      this.cancel();
    },
  },
});
