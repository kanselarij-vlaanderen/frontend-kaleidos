import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';

export default class AgendaitemNotaService extends Service {
  @service store;

  async nota(agendaitem) {
    const latestNotaVersion = await this.getLatestAgendaitemPieceOfDocumentType(
      agendaitem,
      CONSTANTS.DOCUMENT_TYPES.NOTA
    );

    return latestNotaVersion;
  }

  async notaOrVisieNota(agendaitem) {
    const latestNotaVersion = await this.nota(agendaitem);
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

  async getExtractedDecision(agendaitem) {
    const nota = await this.notaOrVisieNota(agendaitem);
    if (!nota) {
      return;
    }
    try {
      const resp = await fetch(`/decision-extraction/${nota.id}`);
      const json = await getJsonPayloadOrThrow(resp);
      return json.content;
    } catch (error) {
      const message = error?.message ? `: ${error?.message}` : '';
      this.toaster.warning(this.intl.t('error-while-fetching-nota-content') + `${message}`);
    };
  }
}
