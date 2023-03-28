import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { TrackedArray } from 'tracked-built-ins';

const DEFAULT_ITEM_STRUCTURE = {
  id: 'id',
  label: 'label',
};

/**
 *
 * @argument label {String} Label for "parent" selector checkbox
 * @argument items {Array} array of objects representing tree "leaf" options
 * @argument itemStructure {Object} Object with keys representing the actual keys in @items
 * @argument selectedItems {Array} Subset of @items representing the selected options
 * @argument didUpdate {Function} Action called whenever the selection is updated. Returns the checked item objects.
 * @argument disabled {Boolean}
 */
export default class CheckboxTree extends Component {
  @tracked selectedItems; // still needed despite TrackedArray in case a new TrackedArray gets assigned

  constructor() {
    super(...arguments);
    this.selectedItems = new TrackedArray(this.args.selectedItems || []);
  }

  get itemStructure() {
    return {...DEFAULT_ITEM_STRUCTURE, ...this.args.itemStructure};
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

    if (isPresent(this.args.didUpdate)) {
      this.args.didUpdate(this.selectedItems);
    }
  }

  @action
  toggleItem(item, checked) {
    if (checked) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
    }

    if (isPresent(this.args.didUpdate)) {
      this.args.didUpdate(this.selectedItems);
    }
  }
}
