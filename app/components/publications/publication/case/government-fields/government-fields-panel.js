import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';

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

export default class PublicationsPublicationCaseGovernmentDomainsPanelComponent extends Component {
  @tracked isOpenEditModal;
  @tracked rows = [];

  constructor() {
    super(...arguments);
    this.groupGovernmentFieldsByDomain.perform();
  }

  @keepLatestTask
  *groupGovernmentFieldsByDomain() {
    const governmentFields = yield this.args.publicationFlow.governmentFields;

    const fieldsByDomain = yield groupBy(governmentFields.toArray(), 'domain');
    this.rows = [...fieldsByDomain.entries()]
      .map(([domain, fields]) => new Row({
        governmentDomain: domain,
        governmentFields: fields,
      }))
      .sortBy('governmentDomain.label');
  }

  @action
  async save(newGovernmentFields) {
    const publicationFlow = this.args.publicationFlow;
    const governmentFields = await publicationFlow.governmentFields;

    governmentFields.clear();
    governmentFields.pushObjects(newGovernmentFields);
    await publicationFlow.save();
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

async function groupBy(array, property) {
  const groups = new Map();

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
