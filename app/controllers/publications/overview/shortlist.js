import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewShortlistController extends Controller {
  @service publicationService;
  @service router;
  @service store;

  @tracked isOpenNewPublicationModal;
  pieceForPublication;
  agendaitemForPublication;
  decisionActivityForPublication;
  caseForPublication;
  mandateesForPublication;

  getAgendaitem = async (piece) => {
    const [agendaitem] = await piece.agendaitems;

    return agendaitem;
  }

  getDecisionDate = async (piece) => {
    const agendaitems = await piece.agendaitems;
    const treatments = await Promise.all(
      agendaitems.map((agendaitem) => agendaitem.treatment)
    );
    const decisionActivities = await Promise.all(
      treatments.map((treatment) => treatment.decisionActivity)
    );
    const decisionDates =
          decisionActivities.map((activity) => activity.startDate);
    if (decisionDates.length) {
      return decisionDates[0];
    }
  }

  getMandateeNames = async (piece) => {
    const agendaitems = await piece.agendaitems;
    const mandatees = (
      await agendaitems
        .reduce(async (accumulator, agendaitem) => {
          const mandatees = await agendaitem.mandatees;
          accumulator = [...accumulator, ...mandatees.toArray()];
          return accumulator;
        }, [])
    ).sortBy('priority');
    const persons = await Promise.all(
      mandatees.map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }

  @action
  async openNewPublicationModal(piece) {
    this.pieceForPublication = piece;
    [this.agendaitemForPublication] = await this.pieceForPublication.agendaitems;
    this.mandateesForPublication = await this.agendaitemForPublication.mandatees;

    const treatment = await this.agendaitemForPublication.treatment;
    this.decisionActivityForPublication = await treatment.decisionActivity;

    console.debug(this.decisionActivityForPublication);

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
      case CONSTANTS.DOCUMENT_TYPES.MB:
        regulationType = await this.store.findRecordByUri(
          'regulation-type',
          CONSTANTS.REGULATION_TYPES.MB
        );
        break;
      default:
        regulationType = undefined;
        break;
    }
    return regulationType;
  }
}
