import Route from '@ember/routing/route';
import { A } from '@ember/array';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import {
  task, timeout
} from 'ember-concurrency';

export default class NewsletterNotaUpdatesRoute extends Route {
  queryParams = {
    sort: {
      refreshModel: true,
    },
  };

  @(task(function *() {
    while (true) {
      yield timeout(3 * 60000);
      this.refresh();
    }
  })) pollModel;

  constructor() {
    super(...arguments);
    this.pollModel.perform();
  }

  async model(params) {
    const processedNotas = A([]);
    const newsletterModel = this.modelFor('newsletter');
    const meeting = newsletterModel.meeting;
    const agenda = newsletterModel.agenda;
    const agendaId = agenda.id;
    const meetingId = meeting.id;
    const notas = await this.store.query('piece', {
      'filter[agendaitems][agenda][:id:]': agendaId,
      'filter[agendaitems][show-as-remark]': false,
      'filter[document-container][type][:uri:]': CONSTANTS.DOCUMENT_TYPES.NOTA,
      'filter[:has:previous-piece]': 'yes', // "Enkel bissen, ter'en, etc" ...
      include: 'agendaitems',
      'fields[agendaitems]': 'id,priority,short-title',
      'fields[piece]': 'id,name,modified',
      'page[size]': 50,
      sort: params.sort,
    });
    for (const nota of notas.toArray()) { // proxyarray to native JS array
      const agendaitemsLinkedToNota = await nota.get('agendaitems');
      let agendaitemOnLatestAgenda;
      for (let index = 0; index < agendaitemsLinkedToNota.length; index++) {
        const agendaitemToFetch = agendaitemsLinkedToNota.objectAt(index);
        const agendaitemFromStore = await this.store.findRecord('agendaitem', agendaitemToFetch.id,
          {
            reload: true,
          });
        const agendaToCheck = await agendaitemFromStore.get('agenda');
        if (agendaToCheck) {
          if (agendaToCheck.get('id') === agendaId) {
            agendaitemOnLatestAgenda = agendaitemFromStore;
          }
        }
      }
      const agendaitemPriority = agendaitemOnLatestAgenda.get('priority');
      const agendaitemId = agendaitemOnLatestAgenda.get('id');
      const agendaitemShortTitle = agendaitemOnLatestAgenda.get('shortTitle');
      const pieceData = await NewsletterNotaUpdatesRoute.getPieceData(nota);
      const processedNota =  {
        meetingId,
        agendaId,
        agendaitemId,
        agendaitemPriority,
        agendaitemShortTitle,
        ...pieceData,
      };
      processedNotas.pushObject(processedNota);
    }
    return processedNotas;
  }

  static async getPieceData(piece) {
    const name = piece.get('name');
    const documentId = piece.get('id');
    const modified = piece.get('modified');
    return {
      documentId: documentId,
      name: name,
      modified: modified,
    };
  }
}
