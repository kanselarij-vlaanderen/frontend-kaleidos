import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

class DomainSelection {
  constructor(domain, isSelected, availableFields, selectedFields) {
    this.domain = domain;
    this.isSelected = isSelected;
    this.availableFields = availableFields;
    this.selectedFields = selectedFields;
  }
}

export default class GovernmentAreasPanel extends Component {
  @service conceptStore;

  @tracked governmentFields;
  @tracked domainSelections;

  constructor() {
    super(...arguments);
    this.loadGovernmentAreas.perform();
  }

  @task
  *loadGovernmentAreas() {
    const concepts = yield this.conceptStore.queryAllGovernmentFields();
    const governmentFields = [];
    const referenceDate = this.args.referenceDate ? this.args.referenceDate : new Date();
    for (const concept of concepts.toArray()) {
      const isInDateRange =
        concept.startDate <= referenceDate &&
        (referenceDate <= concept.endDate ||
          concept.endDate === undefined);

      if (isInDateRange) {
        governmentFields.push(concept);
      }
    }
    this.governmentFields = governmentFields;
    this.calculateDomainSelections.perform();
  }

  @task
  *calculateDomainSelections() {
    let domainsFromAvailableFields = yield Promise.all(
      this.governmentFields.mapBy('broader')
    );

    let uniqueDomains = domainsFromAvailableFields
      .uniq()
      .sortBy('label');

    const selectedFields = this.args.selectedFields ?? [];
    const domainsFromSelectedFields = yield Promise.all(
      selectedFields.mapBy('broader')
    );

    const selectedDomains = this.args.selectedDomains ?? [];

    this.domainSelections = uniqueDomains.map((domain) => {
      const availableFieldsForDomain = this.governmentFields.filter(
        (_, index) => domainsFromAvailableFields[index] === domain
      ).sortBy('position');
      const selectedFieldsForDomain = selectedFields.filter(
        (_, index) => domainsFromSelectedFields[index] === domain
      );

      const isSelected = selectedDomains.includes(domain);

      return new DomainSelection(
        domain,
        isSelected,
        availableFieldsForDomain,
        selectedFieldsForDomain
      )
    })
  }
  
  @action
  toggleDomainSelection(domainSelection, checked) {
    const handler = checked
      ? this.args.onSelectDomains
      : this.args.onDeselectDomains;
    if (handler) {
      handler([domainSelection.domain]);
    }
  }

  @action
  toggleFieldSelection(field, checked) {
    const handler = checked
      ? this.args.onSelectFields
      : this.args.onDeselectFields;
    if (handler) {
      handler([field]);
    }
  }
}