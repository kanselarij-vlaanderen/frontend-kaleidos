import Route from '@ember/routing/route';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import { hash } from 'rsvp';

export default class NewsletterUpdatesRoute extends Route {
  @tracked agendaId;
  @tracked agenda;
  @tracked meeting;

  async model(params) {
    const notas = [];
    this.agendaId = params.id;
    this.agenda = await this.store.findRecord('agenda', this.agendaId);
    this.meeting = await this.agenda.createdFor;
    const agendaitemsForAgenda = await this.agenda.get('agendaitems');
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
              agendaitemId,
              agendaitemPriority,
              agendaitemShortTitle,
              ...documentVersionData,
            };
            notas.push(nota);
          }
        }
      }
    }
    return hash({
      notas: notas,
      agenda: this.agenda,
    });
  }

  static async getDocumentVersionData(documentVersion) {
    const name = await documentVersion.get('name');
    const documentId = await documentVersion.get('id');
    const modified = await documentVersion.get('modified');
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
