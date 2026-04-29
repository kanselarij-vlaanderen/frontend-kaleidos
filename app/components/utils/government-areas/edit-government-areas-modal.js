import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { removeObjects } from 'frontend-kaleidos/utils/array-helpers';

export default class EditGovernmentAreasModal extends Component {
  @service conceptStore;
  @tracked governmentFields;
  @tracked selectedGovernmentFields = [];
  @tracked selectedGovernmentDomains = [];

  constructor() {
    super(...arguments);
    this.loadGovernmentAreas.perform();
  }

  loadGovernmentAreas = task(async () => {
    const concepts = await this.conceptStore.queryAllGovernmentFields();
    const governmentFields = [];
    for (const concept of concepts.slice()) {
      const isInDateRange =
        concept.startDate <= this.args.referenceDate &&
        (this.args.referenceDate <= concept.endDate ||
          concept.endDate === undefined);

      if (isInDateRange) {
        governmentFields.push(concept);
      }
    }
    this.governmentFields = governmentFields;
    await this.loadSelectedAreas.perform();
  })

  save = task(async () => {
    await this.args.onSave(
      this.selectedGovernmentDomains,
      this.selectedGovernmentFields
    );
  })

  loadSelectedAreas = task(async () => {
    // problem solved here: if the government areas were inherited they could be outside the "active" range
    // they are not shown in checkboxes and can't be deselected manually
    // to solve this we remove all inactive fields and domains on save (based on referenceDate)

    // get the active domains, in a set
    let activeGovernmentDomains = await Promise.all(
      this.governmentFields.slice().map((c) => c.broader)
    );
    const uniqueGovernmentDomains = activeGovernmentDomains
      .filter((value, index, array) => array.indexOf(value) === index) // like .uniq()
      .sort((d1, d2) => d1.label.localeCompare(d2.label));

    const governmentFieldsFromArgs = this.args.governmentFields?.slice(0) || []; // making a copy
    const governmentDomainsFromArgs = this.args.governmentDomains?.slice(0) || []; // making a copy

    for (const governmentField of governmentFieldsFromArgs) {
      if (this.governmentFields.includes(governmentField)) {
        this.selectedGovernmentFields.push(governmentField);
      }
    }
    for (const governmentDomain of governmentDomainsFromArgs) {
      if (uniqueGovernmentDomains.includes(governmentDomain)) {
        this.selectedGovernmentDomains.push(governmentDomain);
      }
    }
  })

  @action
  selectField(selectedFields) {
    this.selectedGovernmentFields.push(...selectedFields);
  }

  @action
  deselectField(selectedFields) {
    removeObjects(this.selectedGovernmentFields, selectedFields);
  }

  @action
  selectDomain(selectedDomains) {
    this.selectedGovernmentDomains.push(...selectedDomains);
  }

  @action
  deselectDomain(selectedDomains) {
    removeObjects(this.selectedGovernmentDomains, selectedDomains);
  }
}
