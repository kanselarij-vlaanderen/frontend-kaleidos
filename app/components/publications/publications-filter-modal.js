import Component from '@glimmer/component';
import {
  action, set
} from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsFilter extends Component {
  @tracked filter;

  constructor() {
    super(...arguments);
    this.initBuffers();
  }

  initBuffers() {
    this.filter = this.args.filter;
  }

  @action
  cancel() {
    this.args.onCancel();
  }

  @action
  save() {
    this.args.onSave(this.filter);
  }

  @action
  reset() {
    this.args.onReset();
  }

  @action
  toggleFilterOption(event) {
    const tempArr = this.args.filter;
    set(tempArr, event.target.name, !tempArr[event.target.name]);
    this.filter = tempArr;
  }
}
