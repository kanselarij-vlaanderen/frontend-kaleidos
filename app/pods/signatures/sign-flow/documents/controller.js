import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service'

export default class SignaturesSignFlowDocumentsController extends Controller {
  @service router;
  previousPath;
  counter;
  @tracked signFlow;
  @tracked signingHubUrl;
  @tracked isShown;

  @action
  onLoad(event) {
    this.isShown = true;
    try {
      // If we can access below property, we didn't bump in to a cors error, which
      // in turn means that the iframe redirected back to our domain, because it was done
      // with the required user-interaction
      // TODO: verify whether this works when deployed
      if (event.target.contentWindow.location.origin) {
        this.isShown = false;
        this.close();
      }
    } catch (err) {
      this.counter++
      // To some other internal domain. This probably only occurs on initial load.
    }
  }


  @action
  close() {
    console.log(this.previousPath)
    if (this.previousPath) {
      console.log('history', history.length)
      console.log(this.counter + 1)
      history.go(-(this.counter + 1))
    } else {
      this.router.transitionTo('')
    }
  }
  // @action
  // close() {
  //   // IFrame prevents us from using the back method of the browser's History API
  //   //  since it saves entries for the navigation inside the iframe
  //   if (this.previousPath) {
  //     this.router.recognizeAndLoad(this.previousPath)
  //   } else {
  //     this.router.transitionTo('')
  //   }
  // }
}
