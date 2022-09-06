import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class IsDraftAccessLevel extends Helper {
  @service agendaService;

  async compute(
    _positional,
    { meeting, agenda, agendaitem, piece, accessLevel }
  ) {
    if ([meeting, agenda, agendaitem, piece, accessLevel].includes(undefined)) {
      // Propagation status is based on agenda-related rules.
      // If any of the arguments is undefined, this access level is not related
      // to an agenda so it will always be in draft status.
      return true;
    }

    let isDraft = false;
    switch (accessLevel.uri) {
      case CONSTANTS.ACCESS_LEVELS.MINISTERRAAD: {
        const previousAgenda = await agenda.previousAgenda;
        const isDesignAgenda = (await agenda.status).isDesignAgenda;
        let pieceChanged = false;
        if (previousAgenda) {
          pieceChanged = (
            await this.agendaService.changedPieces(
              agenda.id,
              previousAgenda.id,
              agendaitem.id
            )
          ).includes(piece);
        }
        if (isDesignAgenda && (!isPresent(previousAgenda) || pieceChanged)) {
          isDraft = true;
        }
        break;
      }
      case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING: {
        const decisionPublicationStatus = await (
          await meeting.internalDecisionPublicationActivity
        ).status;
        if (decisionPublicationStatus) {
          isDraft = true;
        }
        break;
      }
      case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID: {
        const documentPublicationStatus = await (
          await meeting.internalDocumentPublicationActivity
        ).status;
        if (
          documentPublicationStatus?.uri !== CONSTANTS.RELEASE_STATUSES.RELEASED
        ) {
          isDraft = true;
        }
        break;
      }
      case CONSTANTS.ACCESS_LEVELS.PUBLIEK: {
        const documentsReleasedToThemis = (
          await meeting.themisPublicationActivities
        ).any(
          (activity) =>
            activity.scope.includes('documents') &&
            activity.startDate < new Date()
        );
        if (documentsReleasedToThemis) {
          isDraft = true;
        }
        break;
      }
      default:
    }
    return isDraft;
  }
}
