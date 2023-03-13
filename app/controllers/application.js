import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  constructor() {
    super(...arguments);
    document.addEventListener('wheel', () => {
    }, {
      capture: true,
      passive: true,
    });
  }
}
