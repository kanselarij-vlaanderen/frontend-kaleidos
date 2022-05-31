import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { TrackedArray } from 'tracked-built-ins';

export default class CheckboxTree extends Component {
  @tracked itemIds; // still needed despite TrackedArray in case a new TrackedArray gets assigned

  constructor() {
    super(...arguments);
    this.itemIds = new TrackedArray(this.args.selectedItems || []);
  }

  get allItemIds() {
    return this.args.items.map((item) => item.id);
  }

  get isSelectedAllItems() {
    return this.allItemIds.every((id) => this.itemIds.indexOf(id) >= 0);
  }

  get isSelectedSomeItems() {
    return this.allItemIds.some((id) => this.itemIds.indexOf(id) >= 0);
  }

  @action
  toggleTree() {
    if (this.isSelectedAllItems) {
      this.itemIds = new TrackedArray([]);
    } else {
      this.itemIds = new TrackedArray(this.allItemIds);
    }

    if (isPresent(this.args.onTreeUpdate)) {
      this.args.onTreeUpdate(this.itemIds);
    }
  }

  @action
  toggleItem(item, event) {
    const checked = event.target.checked;

    if (checked) {
      this.itemIds.push(item.id);
    } else {
      this.itemIds.splice(this.itemIds.indexOf(item.id), 1);
    }

    if (isPresent(this.args.onTreeUpdate)) {
      this.args.onTreeUpdate(this.itemIds);
    }
  }
}
