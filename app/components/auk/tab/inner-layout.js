import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';

export default class InnerLayout extends Component {
  get hasCounter() {
    return isPresent(this.args.counter); // In order to be able to supply 0
  }
}
