import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DocumentController extends Controller {
  @service router;
  @service signatureService;

  @action
  transitionBack() {
    // If no route where you returned from go to the home page
    if (history.length > 1) {
      history.back();
    } else {
      this.router.transitionTo('agendas');
    }
  }
  
  @action
  async markForSignature(piece, agendaItemTreatment) {
    await this.signatureService.markDocumentForSignature(piece, agendaItemTreatment);
  }

  @action
  async unmarkForSignature(piece) {
    await this.signatureService.unmarkDocumentForSignature(piece);
  }
}
