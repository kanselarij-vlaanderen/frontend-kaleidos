import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewShortlistController extends Controller {
  @service publicationService;
  @service router;
  @service store;
  queryParams = [
    {
      sort: {
        type: 'string',
      },
    },
  ];

  @tracked sort = "-agendaitems.treatment.decision-activity.start-date,agendaitems.number";
  @tracked isOpenNewPublicationModal;
  pieceForPublication;
  agendaitemForPublication;
  decisionActivityForPublication;
  caseForPublication;
  mandateesForPublication;

  @action
  async openNewPublicationModal(piece, agendaitem) {
    this.pieceForPublication = piece;
    this.agendaitemForPublication = agendaitem;
    this.mandateesForPublication = await this.agendaitemForPublication.mandatees;

    const treatment = await this.agendaitemForPublication.treatment;
    this.decisionActivityForPublication = await treatment.decisionActivity;

    const subcase = await this.decisionActivityForPublication.subcase;
    const decisionmakingFlow = await subcase.decisionmakingFlow;
    this.caseForPublication = await decisionmakingFlow.case;

    this.isOpenNewPublicationModal = true;
  }

  @action
  closeNewPublicationModal() {
    this.pieceForPublication = null;
    this.agendaitemForPublication = null;
    this.decisionActivityForPublication = null;
    this.mandateesForPublication = null;
    this.caseForPublication = null;

    this.isOpenNewPublicationModal = false;
  }

  @action
  async saveNewPublication(publicationProperties) {
    const regulationType = await this.getRegulationType(this.pieceForPublication);
    const publicationFlow =
      await this.publicationService.createNewPublicationFromMinisterialCouncil(
        publicationProperties,
        {
          case: this.caseForPublication,
          decisionActivity: this.decisionActivityForPublication,
          mandatees: this.mandateesForPublication,
          regulationType: regulationType,
        }
      );
    this.pieceForPublication.publicationFlow = publicationFlow;
    await this.pieceForPublication.save();

    this.closeNewPublicationModal();

    this.router.refresh();
  }

  async getRegulationType(piece) {
    const documentContainer = await piece.documentContainer;
    const documentType = await documentContainer.type;
    let regulationType;
    switch (documentType?.uri) {
      case CONSTANTS.DOCUMENT_TYPES.DECREET:
        regulationType = await this.store.findRecordByUri(
          'regulation-type',
          CONSTANTS.REGULATION_TYPES.DECREET
        );
        break;
      case CONSTANTS.DOCUMENT_TYPES.BVR:
        regulationType = await this.store.findRecordByUri(
          'regulation-type',
          CONSTANTS.REGULATION_TYPES.BVR
        );
        break;
      default:
        regulationType = undefined;
        break;
    }
    return regulationType;
  }
}
