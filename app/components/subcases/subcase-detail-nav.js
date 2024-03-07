import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SubcaseDetailNavComponent extends Component {
  @service currentSession;
  @service impersonation;

  get currentRoute() {
    return this.args.currentRoute;
  }
}
