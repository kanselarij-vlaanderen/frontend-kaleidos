import Route from '@ember/routing/route';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaPrintRoute extends Route {
  @service store;
  @service throttledLoadingService;

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
    await this.loadDocuments.perform(agendaitems);

    return {
      meeting,
      notas,
      announcements,
    };
  }

  @task
  *loadDocuments(agendaitems) {
    yield all(
      agendaitems.map(async (agendaitem) => {
        await this.throttledLoadingService.loadPieces.linked().perform(agendaitem);
      })
    );
  }
}
