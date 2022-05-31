import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { TrackedArray } from 'tracked-built-ins';

export default class CheckboxTree extends Component {
  @tracked selectedItems; // still needed despite TrackedArray in case a new TrackedArray gets assigned

  constructor() {
    super(...arguments);
    this.selectedItems = new TrackedArray(this.args.selectedItems || []);
  }

  get isSelectedAllItems() {
    return this.args.items.every((item) => this.selectedItems.indexOf(item) >= 0);
  }

  get isSelectedSomeItems() {
    return this.args.items.some((item) => this.selectedItems.indexOf(item) >= 0);
  }

  @action
  toggleTree() {
    if (this.isSelectedAllItems) {
      this.selectedItems = new TrackedArray([]);
    } else {
      this.selectedItems = new TrackedArray(this.args.items);
    }

    if (isPresent(this.args.onTreeUpdate)) {
      this.args.onTreeUpdate(this.selectedItems);
    }
  }

  @action
  toggleItem(item, event) {
    const checked = event.target.checked;

    if (checked) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
    }

    if (isPresent(this.args.onTreeUpdate)) {
      this.args.onTreeUpdate(this.selectedItems);
    }
  }
}
