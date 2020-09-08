import Route from '@ember/routing/route';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

export default class NewsletterUpdatesRoute extends Route {
  @tracked agendaId;
  @tracked notas = [];

  async model(params) {
    this.agendaId = params.id;
    const agenda = await this.store.findRecord('agenda', this.agendaId);
    const agendaitemsForAgenda = await agenda.get('agendaitems');
    const agendaitemsArray = agendaitemsForAgenda.toArray();
    for (const agendaitem of agendaitemsArray) {
      const agendaitemPriority = agendaitem.get('priority');
      const agendaitemShortTitle = agendaitem.get('shortTitle');
      const documentVersionsOfAgendaitem = await agendaitem.get('documentVersions');
      const documentVersionsOfAgendaitemArray = documentVersionsOfAgendaitem.toArray();

      if (documentVersionsOfAgendaitemArray) {
        for (const documentVersion of documentVersionsOfAgendaitemArray) {
          const documentVersionData = await NewsletterUpdatesRoute.getDocumentVersionData(documentVersion);
          if (documentVersionData) {
            const nota =  {
              agendaitemPriority,
              agendaitemShortTitle,
              ...documentVersionData,
            };
            this.notas.push(nota);
          }
        }
      }
    }
    return this.notas;
  }

  static async getDocumentVersionData(documentVersion) {
    const name = await documentVersion.get('name');
    const modified = await documentVersion.get('modified');
    const container = await documentVersion.get('documentContainer');
    const type = await container.get('type');
    const label = type.get('label');
    if (label === 'Nota') {
      return {
        name: name,
        modified: modified,
        date: moment(modified).format('DD-MM-YYYY'),
        time: moment(modified).format('HH:MM'),
      };
    }
    return null;
  }
}
