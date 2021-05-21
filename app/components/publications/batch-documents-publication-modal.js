import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  pieceToPublish;

  @tracked isOpenNewPublicationModal = false;
  @tracked newPublicationInitialTitlesPromise;

  @inject store;
  @inject publicationService;

  get pieces() {
    return this.args.pieces;
  }

  // new publication actions
  @action
  async onNewPublication(piece) {
    this.pieceToPublish = piece;
    // const casePromise = this.pieceToPublish.get('agendaitems.firstObject.agendaActivity.subcase.case');
    this.newPublicationInitialTitlesPromise = await this.args.casePromise.then((case_) => ({
      shortTitle: case_.shortTitle,
      longTitle: case_.title,
    }));

    this.isOpenNewPublicationModal = true;
  }

  @task
  *saveNewPublication(publication) {
    const case_ = yield this.casePromise;
    this.publicationService.createNewPublication(publication, {
      case: case_,
    });
    this.isOpenNewPublicationModal = false;
  }

  @action
  cancelNewPublication() {
    this.isOpenNewPublicationModal = false;
  }

  @action
  onCancel() {
    this.args.onCancel();
  }
}
