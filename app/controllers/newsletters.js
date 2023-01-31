import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class NewslettersController extends Controller {
  @service router;

  get activeRoute() {
    return this.router.currentRouteName;
  }
}
