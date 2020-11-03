import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CaseController extends Controller {
  @tracked showingCreateContactModal = false;

  get getShortTitle() {
    const caze = this.model.get('case');
    return caze.get('shortTitle');
  }

  get getLongTitle() {
    const caze = this.model.get('case');
    return caze.get('title');
  }

  @action
  closeCreateContactModal() {
    this.showingCreateContactModal = false;
  }

  @action
  showCreateContactModal() {
    this.showingCreateContactModal = true;
  }
}
