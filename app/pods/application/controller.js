import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service currentSession;
  @service systemAlert;
  @service toaster;

  constructor() {
    super(...arguments);
    document.addEventListener('wheel', () => {
    }, {
      capture: true,
      passive: true,
    });
  }
}
