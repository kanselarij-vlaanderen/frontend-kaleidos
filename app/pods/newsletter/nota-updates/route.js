import Route from '@ember/routing/route';
import moment from 'moment';
import { hash } from 'rsvp';
import { A } from '@ember/array';
import CONFIG from 'fe-redpencil/utils/config';
import getPaginationMetadata from 'fe-redpencil/utils/get-pagination-metadata';
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
    let notas = A([]);
    const newsletterModel = this.modelFor('newsletter');
    const meeting = newsletterModel.meeting;
    const agenda = newsletterModel.agenda;
    const agendaId = agenda.id;
    const meetingId = meeting.id;
    const agendaitemsForAgenda = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agendaId,
      'filter[show-as-remark]': false,
      'page[size]': 300,
      'fields[agendaitems]': 'id,priority,shortTitle',
    });
    // Omzetten van proxyarray naar default JS array
    const agendaitemsArray = agendaitemsForAgenda.toArray();
    for (const agendaitem of agendaitemsArray) {
      const agendaitemPriority = agendaitem.get('priority');
      const agendaitemId = agendaitem.get('id');
      const agendaitemShortTitle = agendaitem.get('shortTitle');

      // Documenten
      const notasOfAgendaitem = await this.store.query('piece', {
        'filter[agendaitem][:id:]': agendaitemId,
        'filter[document-container][type][:id:]': CONFIG.notaID,
      });
      if (notasOfAgendaitem.length) {
        const lastNotaVersion = notasOfAgendaitem.firstObject;
        const documentContainer = await lastNotaVersion.get('documentContainer');
        const allNotaPieces = await documentContainer.get('pieces');
        const piecesOfAgendaitemArray = allNotaPieces.toArray();

        if (piecesOfAgendaitemArray) {
          for (const piece of piecesOfAgendaitemArray) {
            const pieceData = await NewsletterNotaUpdatesRoute.getPieceData(piece);
            if (pieceData) {
              const nota =  {
                meetingId,
                agendaId,
                agendaitemId,
                agendaitemPriority,
                agendaitemShortTitle,
                ...pieceData,
              };
              notas.pushObject(nota);
            }
          }
        }
      }
    }
    if (params.sort.includes('modified')) {
      notas = notas.sortBy('modified');
      if (params.sort.startsWith('-')) {
        notas.reverseObjects();
      }
    }
    const pagination = getPaginationMetadata(0, notas.length, notas.length);
    notas.meta = {
      count: notas.length,
      pagination: pagination,
    };
    return hash({
      notas: notas,
    });
  }

  static async getPieceData(piece) {
    const name = piece.get('name');
    const documentId = piece.get('id');
    const modified = piece.get('modified');
    const container = await piece.get('documentContainer');
    const type = await container.get('type');
    const label = type.get('label');
    if (label === 'Nota') {
      return {
        documentId: documentId,
        name: name,
        modified: modified,
      };
    }
    return null;
  }
}
