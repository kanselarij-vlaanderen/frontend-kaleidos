import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';

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
   */
  @service store;

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
    const governmentAreas = yield this.args.governmentAreas?.toArray();
    if (!governmentAreas) {
      return;
    }
    const domains = [];
    const fields = [];
    // We can't work properly with a list of concepts, so we want to get the more precise model
    for (let governmentArea of governmentAreas) {
      // In order to know which concept we are dealing with, we look up the models by id
      const narrower = yield governmentArea.narrower;
      if (narrower.length == 0) {
        const field = yield this.store.peekRecord('government-field', governmentArea.id);
        fields.pushObject(field);
      } else {
        const domain = yield this.store.peekRecord('government-domain', governmentArea.id);
        domains.pushObject(domain);
      }
    }

    const fieldsByDomain = yield groupBy(fields.toArray(), 'domain', domains.toArray());
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
    let newGovernmentAreas = [];
    for (let area of governmentDomains.concat(governmentFields)) {
      const concept = await this.store.findRecord('concept', area.id);
      newGovernmentAreas.pushObject(concept);
    }
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
