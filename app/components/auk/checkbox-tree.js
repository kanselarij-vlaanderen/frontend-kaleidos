import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CheckboxTree extends Component {
  constructor(owner, args) {
    super(owner, args);

    this.isSelectedAllItems =
      this.itemIds.length == this.allItemIds.length;

    this.isSelectedSomeItems =
      (this.itemIds.length > 0) && (this.itemIds.length < this.allItemIds.length);
  }

  @tracked itemIds = this.args.selectedItems || [];
  @tracked isSelectedAllItems = false;
  @tracked isSelectedSomeItems = false;

  get allItemIds() {
    return this.args.items.map((item) => item.id);
  }

  @action
  toggleTree() {
    this.isSelectedAllItems = !this.isSelectedAllItems;
    this.isSelectedSomeItems = false;

    if (this.isSelectedAllItems) {
      this.itemIds = this.allItemIds;
    } else {
      this.itemIds = [];
    }

    this.args.onTreeUpdate(this.itemIds);
  }

  @action
  toggleItem(item, event) {
    const checked = event.target.checked;

    if (checked) {
      this.itemIds.push(item.id);
    } else {
      this.itemIds.splice(this.itemIds.indexOf(item.id), 1);
    }

    // trigger an array 'reset' so the UI gets updated (see: https://stackoverflow.com/questions/57468327/why-wont-my-tracked-array-update-in-ember-octane)
    this.itemIds = this.itemIds; // eslint-disable-line no-self-assign

    this.isSelectedAllItems =
      this.itemIds.length == this.allItemIds.length;

    this.isSelectedSomeItems =
      (this.itemIds.length > 0) && (this.itemIds.length < this.allItemIds.length);

    this.args.onTreeUpdate(this.itemIds);
  }
}
