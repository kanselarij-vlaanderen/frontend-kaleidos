import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class EditGovernmentAreasModal extends Component {
  @service conceptStore;
  @tracked governmentFields;
  @tracked selectedGovernmentFields = [];
  @tracked selectedGovernmentDomains = [];

  constructor() {
    super(...arguments);
    this.loadGovernmentAreas.perform();
    this.selectedGovernmentFields = this.args.governmentFields?.slice(0) || []; // making a copy
    this.selectedGovernmentDomains =
      this.args.governmentDomains?.slice(0) || []; // making a copy
  }

  @task
  *loadGovernmentAreas() {
    const concepts = yield this.conceptStore.queryAllGovernmentFields();
    const governmentFields = [];
    for (const concept of concepts.toArray()) {
      const isInDateRange =
        concept.startDate <= this.args.referenceDate &&
        (this.args.referenceDate <= concept.endDate ||
          concept.endDate === undefined);

      if (isInDateRange) {
        governmentFields.push(concept);
      }
    }
    this.governmentFields = governmentFields;
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
