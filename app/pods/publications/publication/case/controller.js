import Controller from '@ember/controller';

export default class CaseController extends Controller {
  get getShortTitle() {
    const caze = this.model.get('case');
    return caze.get('shortTitle');
  }

  get getLongTitle() {
    const caze = this.model.get('case');
    return caze.get('title');
  }
}
