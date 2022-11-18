import PublicationsOverviewBaseController from '../_base/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsOverviewAllController extends PublicationsOverviewBaseController {
  @tracked showModal = false;

  @action
  modal() {
    this.showModal = !this.showModal;
  }
}
