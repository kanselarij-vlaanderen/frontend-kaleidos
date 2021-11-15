import Route from '@ember/routing/route';
import { isNone } from '@ember/utils';
import { inject as service } from '@ember/service';

// API currently only supports 1 document
// Known issue: Back button for this page does not work.
export default class SignaturesSignFlowDocumentsRoute extends Route {
  @service router;

  beforeModel() {
    // router.currentRoute is not yet set when a fresh app instance is opened.
    // (router.currentURL is set though)
    const isFreshWithinKaleidos = isNone(this.router.currentRoute);
    if (!isFreshWithinKaleidos) {
      // The property name router.currentURL is misleading: only contains the current path
      this.referringPath = this.router.currentURL;
    }
  }

  async afterModel() {
    const signFlow = this.modelFor('signatures.sign-flow');
    const signSubcase = await signFlow.signSubcase;
    const signMarkingActivity = await signSubcase.signMarkingActivity;
    const piece = await signMarkingActivity.piece;

    const data = await this.loadSigningHubUrl(signFlow.id, piece.id);
    this.signFlow = signFlow;
    this.signingHubUrl = data.url;
  }

  async setupController(controller) {
    controller.signFlow = this.signFlow;
    controller.signingHubUrl = this.signingHubUrl;
    controller.isShown = true;
    controller.referringPath = this.referringPath;
  }

  /**
   * @private
   * @param {number} signFlowId
   * @returns { { url: string } }
   */
  async loadSigningHubUrl(signFlowId, pieceId) {
    const resp = await fetch(
      `/sign-flows/${signFlowId}/signing/pieces/${pieceId}/signinghub-url?collapse_panels=false`
    );
    const data = await resp.json();
    return data;
  }
}
