import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaitemNotaService extends Service {
  @service store;

  async notaOrVisieNota(agendaitem) {
    const latestNotaVersion = await this.getLatestAgendaitemPieceOfDocumentType(
      agendaitem,
      CONSTANTS.DOCUMENT_TYPES.NOTA
    );
    if (latestNotaVersion) {
      return latestNotaVersion;
    }
    return await this.getLatestAgendaitemPieceOfDocumentType(
      agendaitem,
      CONSTANTS.DOCUMENT_TYPES.VISIENOTA
    );
  }

  async getLatestAgendaitemPieceOfDocumentType(agendaitem, documentType) {
    return await this.store.queryOne('piece', {
      filter: {
        agendaitems: {
          ':id:': agendaitem.id,
        },
        'document-container': {
          type: {
            ':uri:': documentType,
          },
        },
        ':has-no:next-piece': 'yes',
      },
      include: 'document-container,document-container.type,access-level',
    });
  }
}
