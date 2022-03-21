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
  /**
   * Since fields are children of domains, this component only takes fields as arguments, and calculates the required domains internally
   * @argument availableFields: All fields that will be listed as options to be checked
   * @argument selectedFields: Which fields should be checked
   * @argument onSelectFields: Action, takes an array of fields
   * @argument onUnSelectFields: Action, takes an array of fields
   */

  @tracked domainSelections;

  get availableFields() {
    return this.args.availableFields || [];
  }

  get selectedFields() {
    return this.args.selectedFields || [];
  }

  get selectedDomains() {
    return this.args.selectedDomains || [];
  }

  constructor() {
    super(...arguments);
    this.calculateDomainSelections.perform();
  }

  @task
  *calculateDomainSelections() {
    const domainsFromFields = yield Promise.all(this.availableFields.map((field) => field.broader));
    const uniqueDomains = [...new Set(domainsFromFields)].sortBy('label');
    const domainSelections = [];
    for (const domain of uniqueDomains) {
      // Filter logic is applied in 2 steps, such that promises to fetch the domains can be executed using Promise.all
      // Step 1: create an array of domains, one for each selected field, using the same order as this.selectedFields
      // Step 2: use the array of step 1 to verify whether the domain fetched for the field is the current domain
      const selectedFieldsDomains = yield Promise.all(this.selectedFields.map((field) => field.broader));
      // eslint-disable-next-line no-unused-vars, id-length
      const selectedFieldsForDomain = this.selectedFields.filter((_, index) => selectedFieldsDomains[index] === domain);

      // Similar filter logic applied in 2 steps as above for the available fields
      const availableFieldsDomains = yield Promise.all(this.availableFields.map((field) => field.broader));
      // eslint-disable-next-line no-unused-vars, id-length
      const availableFieldsForDomain = this.availableFields.filter((_, index) => availableFieldsDomains[index] === domain);
      const isSelected = this.selectedDomains.includes(domain);

      domainSelections.push(new DomainSelection(domain, isSelected, availableFieldsForDomain, selectedFieldsForDomain));
    }
    this.domainSelections = domainSelections;
  }

  @action
  toggleDomainSelection(domainSelection, event) {
    const checked = event.target.checked;
    const handler = checked ? this.args.onSelectDomains : this.args.onUnSelectDomains;
    if (handler) {
      handler([domainSelection.domain]);
    }
  }

  @action
  toggleFieldSelection(field, event) {
    const checked = event.target.checked;
    const handler = checked ? this.args.onSelectFields : this.args.onUnSelectFields;
    if (handler) {
      handler([field]);
    }
  }
}
