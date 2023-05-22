import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SignaturesSelectMinistersModalComponent extends Component {
  @tracked selectedMinisters = [];

  constructor() {
    super(...arguments);
    this.selectedMinisters = this.args.selected ?? [];
  }

  @action
  saveSelected() {
    this.args.onConfirm?.(this.selectedMinisters);
  }
}
