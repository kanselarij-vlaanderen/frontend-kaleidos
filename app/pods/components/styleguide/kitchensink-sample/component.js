import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class kitchensinkSample extends Component {
  @tracked visibility = true;

  // code open or closed on the sample level

  @action
  toggleVisibility() {
    this.visibility = !this.visibility;
  }
}
