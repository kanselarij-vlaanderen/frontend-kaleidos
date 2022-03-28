import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

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

  constructor() {
    super(...arguments);
    this.calculateDomainSelections.perform();
  }

  @task
  *calculateDomainSelections() {
    const availableDomains = this.args.availableDomains.sortBy('label');
    const domainSelections = [];
    for (const availableDomain of availableDomains) {
      const isDomainSelected =
        this.args.selectedDomains.includes(availableDomain);
      const availableFieldsForDomain = yield availableDomain.narrower;
      const selectedFieldsForDomain = availableFieldsForDomain.filter((field) =>
        this.args.selectedFields.includes(field)
      );
      domainSelections.push(
        new DomainSelection(
          availableDomain,
          isDomainSelected,
          availableFieldsForDomain,
          selectedFieldsForDomain
        )
      );
    }
    this.domainSelections = domainSelections;
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
