import Route from '@ember/routing/route';
import { A } from '@ember/array';
import CONFIG from 'fe-redpencil/utils/config';
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
      'filter[agendaitem][agenda][:id:]': agendaId,
      'filter[agendaitem][show-as-remark]': false,
      'filter[document-container][type][:id:]': CONFIG.notaID,
      'filter[:has:previous-piece]': 'yes', // "Enkel bissen, ter'en, etc" ...
      include: 'agendaitem',
      'fields[agendaitem]': 'id,priority,short-title',
      'fields[piece]': 'id,name,modified',
      'page[size]': 50,
      sort: params.sort,
    });
    for (const nota of notas.toArray()) { // proxyarray to native JS array
      const agendaItem = await nota.get('agendaitem');
      const agendaitemPriority = agendaItem.get('priority');
      const agendaitemId = agendaItem.get('id');
      const agendaitemShortTitle = agendaItem.get('shortTitle');
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
