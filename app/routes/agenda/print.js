import Route from '@ember/routing/route';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaPrintRoute extends Route {
  @service store;

  async model() {
    const {
      meeting, agenda,
    } = this.modelFor('agenda');
    const agendaitems = await this.store.query('agendaitem', {
      filter: {
        agenda: {
          id: agenda.id,
        },
      },
      include: 'mandatees',
    });
    const notas = []
    const announcements = [];
    for (const agendaitem of agendaitems.sortBy('number').toArray()) {
      const type = await agendaitem.type;
      if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
        notas.push(agendaitem);
      } else {
        announcements.push(agendaitem);
      }
    }
    await this.ensureDocuments.perform(notas);
    await this.ensureDocuments.perform(announcements);

    // Data needed to determine if access-level is draft
    // const internalDecisionPublicationActivityStatus = await (await meeting.internalDecisionPublicationActivity).status;
    // const internalDocumentPublicationActivityStatus = await (await meeting.internalDocumentPublicationActivity).status;
    // const themisPublicationActivities = await meeting.themisPublicationActivities;

    return {
      agenda,
      meeting,
      // internalDecisionPublicationActivityStatus,
      // internalDocumentPublicationActivityStatus,
      // themisPublicationActivities,
      notas,
      announcements,
    };
  }

  @task
  *ensureDocuments(agendaitems) {
    const tasks = [];
    for (const agendaitem of agendaitems) {
      if (!agendaitem.hasMany('pieces').value()) {
        tasks.push(this.loadDocuments.perform(agendaitem));
      }
    }
    yield all(tasks);
  }

  @task({ maxConcurrency: 2, enqueue: true })
  *loadDocuments(agendaitem) {
    yield agendaitem.hasMany('pieces').reload({
      adapterOptions: {
        namesOnly: true,
      },
    });
  }
}
