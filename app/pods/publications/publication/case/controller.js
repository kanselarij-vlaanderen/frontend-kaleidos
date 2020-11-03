import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CaseController extends Controller {
  @tracked isShowingPersonModal = false;

  get getShortTitle() {
    const caze = this.model.get('case');
    return caze.get('shortTitle');
  }

  get getLongTitle() {
    const caze = this.model.get('case');
    return caze.get('title');
  }

  @action
  showContactPersonModal() {
    this.isShowingPersonModal = true;
  }

  @action
  closeContactPersonModal() {
    this.isShowingPersonModal = false;
  }
}
