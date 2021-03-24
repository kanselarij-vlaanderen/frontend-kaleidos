import Component from '@glimmer/component';
import {
  action, set
} from '@ember/object';

export default class PublicationsFilter extends Component {
  @action
  onCancel() {
    this.args.onCancel();
  }

  @action
  onSave() {
    this.args.onSave();
  }

  @action
  onReset() {
    this.args.onReset();
  }

  @action
  toggleFilterOption(event) {
    const tempArr = this.args.filter;
    set(tempArr, event.target.name, !tempArr[event.target.name]);
    this.args.filter = tempArr;
  }
}
