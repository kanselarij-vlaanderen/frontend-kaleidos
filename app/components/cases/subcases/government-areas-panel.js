import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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

  get areLoadingTasksRunning() {
    return (
      this.loadGovernmentAreas.isRunning ||
      this.calculateDomainSelections.isRunning
    );
  }

  @task
  *loadGovernmentAreas() {
    const concepts = yield this.conceptStore.queryAllGovernmentFields();
    const governmentFields = [];
    const referenceDate = new Date();
    for (const concept of concepts.slice()) {
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
      this.governmentFields.map((c) => c.broader)
    );

    let uniqueDomains = domainsFromAvailableFields
      .uniq()
      .sortBy('label');

    // process args.governmentAreas into domains and fields
    const selectedDomains = [];
    const selectedFields = [];
    for (let governmentArea of this.args.governmentAreas.slice()) {
      const topConceptSchemes = yield governmentArea.topConceptSchemes;
      if (topConceptSchemes.any(scheme => scheme.uri === CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN)) {
        selectedDomains.pushObject(governmentArea);
      } else if (topConceptSchemes.any(scheme => scheme.uri === CONSTANTS.CONCEPT_SCHEMES.BELEIDSVELD)) {
        // only select the field if its active
        if (this.governmentFields.includes(governmentArea)) {
          selectedFields.pushObject(governmentArea);
        }
      }
    }

    const domainsFromSelectedFields = yield Promise.all(
      selectedFields.map((c) => c.broader)
    );

    // construct a DomainSelection for each active domain with its fields
    this.domainSelections = uniqueDomains.map((domain) => {
      const availableFieldsForDomain = this.governmentFields.filter(
        (_, index) => domainsFromAvailableFields[index] === domain
      ).sortBy('position');
      const selectedFieldsForDomain = selectedFields.filter(
        (_, index) => domainsFromSelectedFields[index] === domain
      );

      // it is possible to have a selected domain from args even if all fields are outside the reference date
      const isSelected = selectedDomains.includes(domain);

      // Update our new selection to args
      if (selectedFieldsForDomain.length) {
        this.args.onSelectFields(selectedFieldsForDomain);
      }
      if (isSelected) {
        this.args.onSelectDomains([domain]);
      }

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