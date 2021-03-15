import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

class DomainSelection {
  constructor(domain, availableFields, selectedFields) {
    this.domain = domain;
    this.availableFields = availableFields;
    this.selectedFields = selectedFields;
  }

  get isSelected() {
    return this.availableFields.every((field) => this.selectedFields.includes(field));
  }
}

export default class DomainFieldIseDomainsFieldsSelectorFormComponent extends Component {
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

  constructor() {
    super(...arguments);
    this.calculateDomainSelections.perform();
  }

  @task
  *calculateDomainSelections() {
    const domainsFromFields = yield Promise.all(this.availableFields.map((field) => field.domain));
    const uniqueDomains = [...new Set(domainsFromFields)];
    const domainSelections = [];
    for (const domain of uniqueDomains) {
      const selectedFieldsDomains = yield Promise.all(this.selectedFields.map((field) => field.domain)); // in 2 steps, async filter logic
      const selectedFieldsForDomain = this.selectedFields.filter((_, index) => selectedFieldsDomains[index] === domain); // eslint-disable-line
      const availableFieldsDomains = yield Promise.all(this.availableFields.map((field) => field.domain));
      const availableFieldsForDomain = this.availableFields.filter((_, index) => availableFieldsDomains[index] === domain); // eslint-disable-line
      domainSelections.push(new DomainSelection(domain, availableFieldsForDomain, selectedFieldsForDomain));
    }
    this.domainSelections = domainSelections;
  }

  @action
  async toggleDomainSelection(domainSelection, flag) {
    const domainFields = domainSelection.availableFields;
    const fieldsToToggle = domainFields.filter((domainField) => domainSelection.selectedFields.includes(domainField) !== flag);
    const handler = flag ? this.args.onSelectFields : this.args.onUnSelectFields;
    if (handler) {
      handler(fieldsToToggle);
    }
  }

  @action
  toggleFieldSelection(field, flag) {
    const handler = flag ? this.args.onSelectFields : this.args.onUnSelectFields;
    if (handler) {
      handler([field]);
    }
  }
}
