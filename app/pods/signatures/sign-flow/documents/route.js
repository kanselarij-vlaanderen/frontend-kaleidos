import Route from '@ember/routing/route';

export default class SignaturesSignFlowDocumentsRoute extends Route {
  async model() {
    const parentParams = this.paramsFor('signatures.sign-flow');
    const signFlowId = parentParams.signflow_id;

    const signFlow = this.modelFor('signatures.sign-flow');
    const signSubcase = await signFlow.signSubcase;
    const signMarkingActivity = await signSubcase.signMarkingActivity;
    const piece = await signMarkingActivity.piece;

    const data = await this.loadSigningHubUrl(signFlowId, piece.id)
    this.signFlow = signFlow;
    return data;
  }

  async setupController(controller) {
    controller.signFlow = this.signFlow;
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
