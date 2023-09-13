import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RevertActionToastComponent extends Component {
  @action
  onUndo() {
    this.args.options?.onUndo?.();
    this.args.close();
  }
}
