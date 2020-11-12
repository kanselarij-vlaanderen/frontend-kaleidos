import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseController extends Controller {
  @tracked collapsed = true;
  @tracked caze = this.model.get('case');

  get getShortTitle() {
    // const caze = this.model.get('case');
    // this.testCaze = caze;
    return this.caze.get('shortTitle');
  }

  get getLongTitle() {
    // const caze = this.model.get('case');
    return this.caze.get('title');
  }

  get publicationNumber() {
    console.log(this.caze.get('publicationFlow'));
    return this.caze.get('publicationFlow').get('publicationNumber');
  }

  @action
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}
