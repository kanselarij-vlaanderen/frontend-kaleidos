import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UtilsBackButtonComponent extends Component {
  @service router;

  @action
  goToParentRoute() {
    const parentRoute = this.router.currentRoute.parent;
    if (parentRoute && parentRoute.name !== 'application') {
      this.router.transitionTo(parentRoute.name);
    }
  }
}
