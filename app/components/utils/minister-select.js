import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UtilsMinisterSelectComponent extends Component {
  @tracked ministersHidden = true;

  @action
  toggleMinistersHidden() {
    this.ministersHidden = !this.ministersHidden;
  }
}