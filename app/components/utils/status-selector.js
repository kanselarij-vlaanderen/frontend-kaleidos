import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action  } from '@ember/object';

export default class StatusSelectorComponent extends Component {
  @tracked selected;

  constructor() {
    super(...arguments);
    this.selected = this.args.selected;
  }

  options = [
    "Formeel OK",
    "Nog niet formeel OK"
  ];

  @action
  toggleSelected(status) {
    this.selected.push(status);
    this.args.onChange?.(this.selected);
  }
}
