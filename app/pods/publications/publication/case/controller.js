import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

import { action } from '@ember/object';

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
    console.log('show person modal');
  }

  @action
  closeContactPersonModal() {
    this.isShowingPersonModal = false;
    console.log('close clicked');
  }
}
