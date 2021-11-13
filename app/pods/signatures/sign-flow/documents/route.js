import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SignaturesSignFlowDocumentsRoute extends Route {
  @service router;

  activate() {
    this.counter = 0;
  }

  async beforeModel() {
    this.indexPrevious = history.length;
    console.log(history.length)
    this.previousPath = this.router.currentURL //this.getCurrentPath()
  }

  getCurrentPath() {
    let location = window.location;
    let path = location.pathname + location.hash + location.search;
    let rootURL = this.router.rootURL;
    path = path.substring(rootURL.length - 1);
    return path
  }

  async afterModel() {
    const parentParams = this.paramsFor('signatures.sign-flow');
    const signFlowId = parentParams.signflow_id;

    const signFlow = this.modelFor('signatures.sign-flow');
    const signSubcase = await signFlow.signSubcase;
    const signMarkingActivity = await signSubcase.signMarkingActivity;
    const piece = await signMarkingActivity.piece;

    const data = await this.loadSigningHubUrl(signFlowId, piece.id);
    this.signFlow = signFlow;
    this.signingHubUrl = data.url;
  }

  async setupController(controller) {
    controller.signFlow = this.signFlow;
    controller.signingHubUrl = this.signingHubUrl;
    controller.isShown = true;
    controller.indexPrevious = this.indexPrevious;
    let currentPath = this.getCurrentPath();
    console.log(this.router.currentURL)
    controller.previousPath = this.router.currentURL;
    // if (currentPath !== this.previousPath) {
    //   controller.previousPath = this.previousPath;
    // }
    if (this.counter !== undefined) {
      controller.counter = this.counter;
      delete this.counter;
    }
  }

  /**
   * @private
   * @param {number} signFlowId
   * @returns { { url: string } }
   */
  async loadSigningHubUrl(signFlowId, pieceId) {
    const resp = await fetch(`/sign-flows/${signFlowId}/signing/pieces/${pieceId}/signinghub-url?collapse_panels=false`);
    const data = await resp.json();
    return data;
  }
}
