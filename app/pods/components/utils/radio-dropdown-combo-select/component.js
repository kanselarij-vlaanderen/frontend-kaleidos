import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class RadioDropdownComboSelectComponent extends Component {
  @tracked othersShown = false;

  @tracked selectedOption = null;

  constructor() {
    super(...arguments);
    if (this.args.selected) {
      this.selectedOption = this.args.selected;
    }
    this.othersShown = this.selectedIsInOthers;
  }

  get labelKey() {
    return this.args.labelKey || 'label';
  }

  get radioName() {
    return `${guidFor(this)}-radio`;
  }

  get radioOptionsSize() {
    return this.args.radioOptionsSize || 5;
  }

  get radioOptions() {
    return this.args.options.slice(0, this.radioOptionsSize);
  }

  get otherOptions() {
    return this.args.options.slice(this.radioOptionsSize, this.args.options.length);
  }

  get selectedIsInOthers() { // The selected option is one of "otherOptions"
    return this.otherOptions.includes(this.selectedOption);
  }

  @action
  select(opt) {
    if (this.args.onSelect) {
      this.args.onSelect(...arguments);
    }
    this.selectedOption = opt;
    if (!this.otherOptions.includes(opt)) {
      this.othersShown = false;
    }
  }

  @action
  showOthers() {
    if (this.args.onSelect) {
      this.args.onSelect(null); // Clicking "others" must behave as an unselect
    }
    this.selectedOption = null;
    this.othersShown = true;
  }
}
