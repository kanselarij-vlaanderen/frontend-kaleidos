import Route from '@ember/routing/route';
import { task, all } from 'ember-concurrency';
import { service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaPrintRoute extends Route {
  @service store;
  @service throttledLoadingService;
  @service agendaService;

  async model() {
    const { meeting, agenda } = this.modelFor('agenda');
    const agendaitems = await this.store.query('agendaitem', {
      filter: {
        agenda: {
          id: agenda.id,
        },
      },
      include: 'mandatees,agenda-activity.subcase.type',
    });
    const notas = [];
    const announcements = [];
    const sortedAgendaitems = agendaitems?.slice().sort((a1, a2) => a1.number - a2.number)
    for (const agendaitem of sortedAgendaitems) {
      const type = await agendaitem.type;
      if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
        notas.push(agendaitem);
      } else {
        announcements.push(agendaitem);
      }
    }
    const decisionPublicationActivity = await meeting.internalDecisionPublicationActivity;
    const decisionPublicationStatus = await decisionPublicationActivity?.status;
    const decisionsAreReleased = decisionPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    await this.loadDocuments.perform(sortedAgendaitems);

    const previousAgenda = await agenda.previousVersion;
    let newAgendaitems;
    if (previousAgenda) {
      newAgendaitems = await this.agendaService.newAgendaItems(agenda.id, previousAgenda.id);
    }

    const newPiecesOnAgenda = [];
    const agendaitemNewPieces = sortedAgendaitems.map(async (agendaitem) => {
      if (previousAgenda) {
        const newPieces = await this.agendaService.changedPieces(
          agenda.id,
          previousAgenda.id,
          agendaitem.id
        );
        if (newPieces.length > 0) {
          newPiecesOnAgenda.push(...newPieces);
        }
      }
    });
    await all(agendaitemNewPieces);

    return {
      meeting,
      notas,
      announcements,
      decisionsAreReleased,
      newAgendaitems,
      newPiecesOnAgenda
    };
  }

  loadDocuments = task(async (agendaitems) => {
    await all(
      agendaitems.map(async (agendaitem) => {
        await this.throttledLoadingService.loadPieces.perform(agendaitem);
      })
    );
  });
}
