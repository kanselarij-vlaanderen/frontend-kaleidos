import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isPresent } from '@ember/utils';

export default class IsAccessLevelInEffect extends Helper {
  @service agendaService;

  async compute([accessLevel, piece]) {
    if (accessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE) {
      // Always in effect
      return true;
    }

    let inEffect = true;
    if (piece) {
      // Always assume that we're dealing with the latest agenda
      const agendaitems = (await piece.agendaitems).toArray();
      let agendaitem;
      for (const ag of agendaitems) {
        const next = await ag.nextVersion;
        if (!isPresent(next)) {
          agendaitem = ag;
          break;
        }
      }
      if (agendaitem === undefined) {
        return false;
      }
      const agenda = await agendaitem.agenda;
      const meeting = await agenda.createdFor;

      switch (accessLevel.uri) {
        case CONSTANTS.ACCESS_LEVELS.MINISTERRAAD:
          const isDesignAgenda = (await agenda.status).isDesignAgenda;
          const previousAgenda = await agenda.previousAgenda;
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
          if (isDesignAgenda && (!isPresent(previousAgenda) | pieceChanged)) {
            inEffect = false;
          }
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          const decisionsReleased = isPresent(meeting.releasedDecisions);
          if (!decisionsReleased) {
            inEffect = false;
          }
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          const documentsReleased = isPresent(meeting.releasedDocuments);
          if (!documentsReleased) {
            inEffect = false;
          }
          break;
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          const documentsReleasedToThemis = (
            await meeting.themisPublicationActivities
          ).any((activity) => activity.scope.includes('documents'));
          if (!documentsReleasedToThemis) {
            inEffect = false;
          }
          break;
        default:
      }
    }
    return inEffect;
  }
}
