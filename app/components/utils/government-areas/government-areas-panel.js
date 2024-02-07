import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

class Row {
  @tracked governmentDomain;
  @tracked governmentFields;

  constructor(properties) {
    this.governmentDomain = properties.governmentDomain;
    this.governmentFields = properties.governmentFields;
  }

  get sortedGovernmentFields() {
    return this.governmentFields.sortBy('label');
  }
}

export default class GovernmentAreasPanel extends Component {
  /**
   * @argument governmentAreas: the list of concepts from the model
   * @argument allowEditing
   * @argument onSave
   */

  @tracked isOpenEditModal;
  @tracked rows = [];
  @tracked governmentDomains = [];
  @tracked governmentFields = [];

  constructor() {
    super(...arguments);
    this.groupGovernmentFieldsByDomain.perform();
  }

  @keepLatestTask
  *groupGovernmentFieldsByDomain() {
    const governmentAreas = this.args.governmentAreas?.slice();
    if (!governmentAreas) {
      return;
    }
    const domains = [];
    const fields = [];
    for (let governmentArea of governmentAreas) {
      const topConceptSchemes = yield governmentArea.topConceptSchemes;
      if (topConceptSchemes.any(scheme => scheme.uri === CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN)) {
        domains.pushObject(governmentArea);
      } else if (topConceptSchemes.any(scheme => scheme.uri === CONSTANTS.CONCEPT_SCHEMES.BELEIDSVELD)) {
        fields.pushObject(governmentArea);
      }
    }

    const fieldsByDomain = yield groupBy(fields.slice(), 'broader', domains.slice());
    this.rows = [...fieldsByDomain.entries()]
      .map(([domain, fields]) => new Row({
        governmentDomain: domain,
        governmentFields: fields,
      }))
      .sortBy('governmentDomain.label');
    this.governmentFields = fields;
    this.governmentDomains = domains;
  }

  @action
  async save(governmentDomains, governmentFields) {
    let newGovernmentAreas = governmentDomains.concat(governmentFields);
    await this.args.onSave(newGovernmentAreas);
    this.groupGovernmentFieldsByDomain.perform();
    this.isOpenEditModal = false;
  }

  @action
  showEditModal() {
    this.isOpenEditModal = true;
  }

  @action
  closeEditModal() {
    this.isOpenEditModal = false;
  }
}

async function groupBy(array, property, groupKeys) {
  const groups = new Map();

  for (const groupKey of groupKeys) {
    const group = groups.get(groupKey);
    if (!group) {
      groups.set(groupKey, []);
    }
  }

  for (const element of array) {
    const groupKey = await element.get(property);
    const group = groups.get(groupKey);
    if (!group) {
      groups.set(groupKey, [element]);
    } else {
      group.push(element);
    }
  }

  return groups;
}
