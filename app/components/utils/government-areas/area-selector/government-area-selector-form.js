import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
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

export default class GovernmentAreaSelectorForm extends Component {
  @tracked domainSelections;

  constructor() {
    super(...arguments);
    this.calculateDomainSelections.perform();
  }

  @task
  *calculateDomainSelections() {
    // Filter logic is applied in 2 steps, such that promises to fetch the domains can be executed using Promise.all
    // Step 1: create an array of domains, one for each selected field, using the same order as this.selectedFields
    // Step 2: use the array of step 1 to verify whether the domain fetched for the field is the current domain
    const availableFields = this.args.availableFields ?? [];
    let domainsFromAvailableFields = yield Promise.all(
      availableFields.mapBy('broader')
    );

    let uniqueDomains = domainsFromAvailableFields
      .filterBy('deprecated', false)
      .uniq()
      .sortBy('label');

    const selectedFields = this.args.selectedFields ?? [];
    const domainsFromSelectedFields = yield Promise.all(
      selectedFields.mapBy('broader')
    );

    const selectedDomains = this.args.selectedDomains ?? [];

    this.domainSelections = uniqueDomains.map((domain) => {
      const availableFieldsForDomain = availableFields.filter(
        (_, index) => domainsFromAvailableFields[index] === domain
      );
      const selectedFieldsForDomain = selectedFields.filter(
        (_, index) => domainsFromSelectedFields[index] === domain
      );
      const isSelected = selectedDomains.includes(domain);

      return new DomainSelection(
        domain,
        isSelected,
        availableFieldsForDomain,
        selectedFieldsForDomain
      );
    });
  }

  @action
  toggleDomainSelection(domainSelection, event) {
    const checked = event.target.checked;
    const handler = checked
      ? this.args.onSelectDomains
      : this.args.onUnSelectDomains;
    if (handler) {
      handler([domainSelection.domain]);
    }
  }

  @action
  toggleFieldSelection(field, event) {
    const checked = event.target.checked;
    const handler = checked
      ? this.args.onSelectFields
      : this.args.onUnSelectFields;
    if (handler) {
      handler([field]);
    }
  }
}
