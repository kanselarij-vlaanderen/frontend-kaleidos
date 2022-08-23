import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UtilsSearchTooltipComponent extends Component {
  @tracked isOpenModal = false;

  @action
  openModal() {
    this.isOpenModal = true;
  }

  @action
  closeModal() {
    this.isOpenModal = false;
  }
}
