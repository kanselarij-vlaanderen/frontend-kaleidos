import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class SignaturesSignFlowDocumentsController extends Controller {
  @service router;
  referringPath;
  @tracked signFlow;
  @tracked signingHubUrl;
  @tracked isShown;

  @action
  onLoad(event) {
    try {
      // If we can access below property, we didn't bump in to a cors error, which
      // in turn means that the iframe redirected back to our domain, because it was done
      // with the required user-interaction
      /** @todo Verify whether this works when deployed */
      if (event.target.contentWindow.location.origin) {
        this.isShown = false;
        this.close();
      }
    } catch (err) {
      // To some other internal domain. This probably only occurs on initial load.
    }
  }

  @action
  close() {
    // Because an iFrame saves entries to history,
    //  normal navigation is easier to implement than going back (with History API)
    //  (which seems possible by counting iFrame's "load" events)
    // The disadvantage of normal navigation is, that it is not possible to go back when a page is refreshed.
    // It might feel more natural anyway, since this modal has a separate URL.
    if (this.referringPath) {
      this.router.transitionTo(this.referringPath);
    } else {
      // transition to default route
      this.router.transitionTo('');
    }
  }
}
