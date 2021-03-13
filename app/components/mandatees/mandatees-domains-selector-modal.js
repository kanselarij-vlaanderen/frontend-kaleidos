import Component from '@glimmer/component';
import {
  refreshData,
  selectDomain,
  selectField,
  prepareMandateeRowAfterEdit
} from 'frontend-kaleidos/utils/manage-minister-util';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MandateesMandateesDomainsSelectorModalComponent extends Component {
  @service intl;

  @tracked selectedMandatee;
  @tracked rowToShow;

  @tracked isLoading;

  get isAddingMinister() {
    return !this.args.mandatee;
  }

  get title() {
    if (this.isAddingMinister) {
      return this.intl.t('add-minister');
    }
    return this.intl.t('edit-minister');
  }

  consttructor() {
    super(...arguments);
    this.selectedMandatee = this.args.mandatee;
  }

  @action
  async saveChanges() {
    this.isLoading = true;
    const {
      selectedMandatee, rowToShow,
    } = this;
    const newMinisterRow = await prepareMandateeRowAfterEdit(selectedMandatee, rowToShow);
    this.args.saveChanges(selectedMandatee, newMinisterRow);
    this.isLoading = false;
    this.cancel();
  }

  @action
  async selectField(domain, value) {
    const foundDomain = await this.rowToShow.domains;
    await selectField(foundDomain, domain, value);
  }

  @action
  async mandateeSelected(mandatee) {
    this.selectedMandatee = mandatee;
    this.isLoading = true;
    const rowsToShow = await refreshData(mandatee, await this.get('mandateeRows'));
    this.rowToShow = rowsToShow;
    this.isLoading = false;
  }

  @action
  async selectDomain(domain, value) {
    const rowToShowFields = await this.rowToShow.fields;
    await selectDomain(rowToShowFields, domain, value);
  }

  @action
  cancel() {
    this.args.cancel();
  }
}
