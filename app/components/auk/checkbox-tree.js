import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { TrackedArray } from 'tracked-built-ins';
import { addObject } from 'frontend-kaleidos/utils/array-helpers';

const DEFAULT_ITEM_STRUCTURE = {
  id: 'id',
  label: 'label',
};

/**
 *
 * @argument label {String} Label for "parent" selector checkbox
 * @argument layout {String} Layout type for the inner control group
 * @argument items {Array} array of objects representing tree "leaf" options
 * @argument itemStructure {Object} Object with keys representing the actual keys in @items
 * @argument selectedItems {Array} Subset of @items representing the selected options
 * @argument didUpdate {Function} Action called whenever the selection is updated. Returns the checked item objects.
 * @argument disabled {Boolean}
 * @argument mandatoryItem {Object} 1 @item representing a mandatory selected option
 */
export default class CheckboxTree extends Component {
  @tracked selectedItems; // still needed despite TrackedArray in case a new TrackedArray gets assigned

  constructor() {
    super(...arguments);
    this.selectedItems = new TrackedArray(this.args.selectedItems || []);
  }

  get layoutClass() {
    if (this.args.layout == 'grid') return 'au-c-control-group--grid';
    else return '';
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
    if (this.args.mandatoryItem) {
      addObject(this.selectedItems, this.args.mandatoryItem);
    }

    if (isPresent(this.args.didUpdate)) {
      this.args.didUpdate(this.selectedItems);
    }
  }

  @action
  toggleItem(selectedItems) {
    this.selectedItems = new TrackedArray(selectedItems);

    if (isPresent(this.args.didUpdate)) {
      this.args.didUpdate(this.selectedItems);
    }
  }
}
