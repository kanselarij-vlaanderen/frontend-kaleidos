import Route from '@ember/routing/route';
import moment from 'moment';
import { hash } from 'rsvp';
import { A } from '@ember/array';


export default class NewsletterUpdatesRoute extends Route {
  queryParams = {
    sort: {
      refreshModel: true,
    },
  };
  async model(params) {
    return this.retrieveModelData(params);
  }
  async retrieveModelData(params) {
    let notas = A([]);
    const agendaId = params.id;
    const agenda = await this.store.findRecord('agenda', agendaId);
    const meeting = await agenda.get('createdFor');
    const meetingId = await meeting.get('id');
    const agendaitemsForAgenda = await agenda.get('agendaitems');
    const agendaitemsArray = agendaitemsForAgenda.toArray();
    for (const agendaitem of agendaitemsArray) {
      const agendaitemPriority = agendaitem.get('priority');
      const agendaitemId = agendaitem.get('id');
      const agendaitemShortTitle = agendaitem.get('shortTitle');
      const documentVersionsOfAgendaitem = await agendaitem.get('documentVersions');
      const documentVersionsOfAgendaitemArray = documentVersionsOfAgendaitem.toArray();

      if (documentVersionsOfAgendaitemArray) {
        for (const documentVersion of documentVersionsOfAgendaitemArray) {
          const documentVersionData = await NewsletterUpdatesRoute.getDocumentVersionData(documentVersion);
          if (documentVersionData) {
            const nota =  {
              meetingId,
              agendaId,
              agendaitemId,
              agendaitemPriority,
              agendaitemShortTitle,
              ...documentVersionData,
            };
            notas.pushObject(nota);
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
    return hash({
      notas: notas,
    });
  }

  static async getDocumentVersionData(documentVersion) {
    const name = documentVersion.get('name');
    const documentId = documentVersion.get('id');
    const modified = documentVersion.get('modified');
    const container = await documentVersion.get('documentContainer');
    const type = await container.get('type');
    const label = type.get('label');
    if (label === 'Nota') {
      return {
        documentId: documentId,
        name: name,
        modified: modified,
        date: moment(modified).format('DD-MM-YYYY'),
        time: moment(modified).format('HH:MM'),
      };
    }
    return null;
  }
}
