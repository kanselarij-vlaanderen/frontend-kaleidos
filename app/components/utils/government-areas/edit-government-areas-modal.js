import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class EditGovernmentAreasModal extends Component {
  @service store;
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
    const concepts = this.store.peekAll('concept');
    const governmentFields = [];
    for (const concept of concepts.toArray()) {
      const topConceptSchemes = yield concept.topConceptSchemes;
      const isGovernmentField = topConceptSchemes.any((conceptScheme) => conceptScheme.uri === CONSTANTS.CONCEPT_SCHEMES.BELEIDSVELD);
      const isInDateRange = concept.startDate <= this.args.datetimeForGovernmentAreas && (this.args.datetimeForGovernmentAreas <= concept.endDate || concept.endDate === undefined);

      if (isGovernmentField && isInDateRange) {
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
