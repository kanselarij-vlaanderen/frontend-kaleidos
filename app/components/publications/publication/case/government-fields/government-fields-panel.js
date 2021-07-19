import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

class Row {
  @tracked governmentDomain;
  @tracked _governmentFields;

  constructor(properties) {
    this.governmentDomain = properties.governmentDomain;
    this._governmentFields = properties.governmentFields;
  }

  get governmentFields() {
    return this._governmentFields.sortBy('label');
  }
}

export default class PublicationsPublicationCaseGovernmentDomainsPanelComponent extends Component {
  @tracked isOpenEditModal;

  get governmentFields() {
    return this.args.publicationFlow.governmentFields.toArray();
  }

  get rows() {
    const governmentFields = this.args.publicationFlow.governmentFields.toArray();

    const fieldsByDomain = groupBy(governmentFields, 'domain').then((fieldsByDomain) => {
      const rows = [...fieldsByDomain.entries()]
        .map(([domain, fields]) => new Row({
          governmentDomain: domain,
          governmentFields: fields,
        }))
        .sortBy('governmentDomain.label');

      return rows;
    });

    return fieldsByDomain;
  }

  @action
  async save(newGovernmentFields) {
    const publicationFlow = this.args.publicationFlow;
    const governmentFields = publicationFlow.governmentFields;

    governmentFields.clear();
    governmentFields.pushObjects(newGovernmentFields);
    await publicationFlow.save();

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
