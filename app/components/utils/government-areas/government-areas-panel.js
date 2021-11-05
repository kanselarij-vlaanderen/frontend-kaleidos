import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';

// class Row {
//   @tracked governmentDomain;
//   @tracked governmentFields;
//
//   constructor(properties) {
//     this.governmentDomain = properties.governmentDomain;
//     this.governmentFields = properties.governmentFields;
//   }
//
//   get sortedGovernmentFields() {
//     return this.governmentFields.sortBy('label');
//   }
// }

export default class GovernmentAreasPanel extends Component {
  @tracked isOpenEditModal;
  @tracked rows = [];
  @tracked areas;

  constructor() {
    super(...arguments);
    this.groupGovernmentFieldsByDomain.perform();
  }

  @keepLatestTask
  *groupGovernmentFieldsByDomain() {
    const caze = yield this.args.case;
    console.log(caze)
    this.areas = yield caze.governmentAreas;

    // const fieldsByDomain = yield groupBy(governmentFields.toArray(), 'domain');
    // this.rows = [...fieldsByDomain.entries()]
    //   .map(([domain, fields]) => new Row({
    //     governmentDomain: domain,
    //     governmentFields: fields,
    //   }))
    //   .sortBy('governmentDomain.label');
  }

  @action
  async save(newGovernmentFields) {

    await this.args.onSave(newGovernmentFields);

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

// async function groupBy(array, property) {
//   const groups = new Map();
//
//   for (const element of array) {
//     const groupKey = await element.get(property);
//     const group = groups.get(groupKey);
//     if (!group) {
//       groups.set(groupKey, [element]);
//     } else {
//       group.push(element);
//     }
//   }
//
//   return groups;
// }
