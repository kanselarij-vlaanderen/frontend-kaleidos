import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  pieceToPublish;

  @tracked isOpenNewPublicationModal = false;
  @tracked newPublicationInitialTitlesPromise;
  @tracked pieces;

  @inject store;
  @inject publicationService;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  @task
  *loadData() {
    const data = yield this.args.dataPromise;
    const pieces = data.pieces;
    // <DocumentList /> expects iterable
    this.pieces = pieces.toArray();
  }

  // new publication actions
  @action
  async openNewPublicationModal(piece) {
    this.pieceToPublish = piece;
    this.newPublicationInitialTitlesPromise = await this.args.dataPromise
      .then(async(data) => {
        const case_ = await data.case;
        return {
          shortTitle: case_.shortTitle,
          longTitle: case_.title,
        };
      });

    this.isOpenNewPublicationModal = true;
  }

  @task
  *saveNewPublication(publicationProperties) {
    const data = yield this.args.dataPromise;
    const publicationFlow = yield this.publicationService.createNewPublicationFromMinisterialCouncil(publicationProperties, {
      case: data.case,
    });
    this.pieceToPublish.publicationFlow = publicationFlow;
    yield this.pieceToPublish.save();
    this.isOpenNewPublicationModal = false;
  }

  @action
  cancelNewPublication() {
    this.isOpenNewPublicationModal = false;
  }
}
