import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsOverviewStartController extends Controller {
  @tracked showModal = false;

  @action
  modal() {
    this.showModal = !this.showModal;
  }
}
