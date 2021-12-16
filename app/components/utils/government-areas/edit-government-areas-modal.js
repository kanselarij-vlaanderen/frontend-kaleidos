import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class EditGovernmentAreasModal extends Component {
  @service store;
  @tracked governmentFields;
  @tracked selectedGovernmentFields = [];
  @tracked governmentDomains;
  @tracked selectedGovernmentDomains = [];

  constructor() {
    super(...arguments);
    this.loadGovernmentAreas.perform();
    this.selectedGovernmentFields = this.args.governmentFields?.slice(0) || []; // making a copy
    this.selectedGovernmentDomains = this.args.governmentDomains?.slice(0) || []; // making a copy
  }

  @task
  *loadGovernmentAreas() {
    this.governmentDomains = yield this.store.query('concept', {
      'filter[top-concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN,
      include: 'broader,narrower',
      'page[size]': 100
    });
    this.governmentFields = yield this.store.query('concept', {
      'filter[top-concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.BELEIDSVELD,
      include: 'broader,narrower',
      'page[size]': 100
    });
  }

  @task
  *save() {
    yield this.args.onSave(
      this.selectedGovernmentDomains,
      this.selectedGovernmentFields
    );
  }

  @action
  selectField(selectedField) {
    this.selectedGovernmentFields.pushObjects(selectedField);
  }

  @action
  deselectField(selectedField) {
    this.selectedGovernmentFields.removeObjects(selectedField);
  }

  @action
  selectDomain(selectedDomain) {
    this.selectedGovernmentDomains.pushObjects(selectedDomain);
  }

  @action
  deselectDomain(selectedDomain) {
    this.selectedGovernmentDomains.removeObjects(selectedDomain);
  }
}
