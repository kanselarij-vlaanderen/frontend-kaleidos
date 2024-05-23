import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';

export default class DocumentService extends Service {
  @service toaster;

  async checkAndRestamp(pieces) {
    const piecesToStamp = pieces.filter(
      (piece) =>
        piece.stamp &&
        new VRDocumentName(piece.name).vrNumberWithSuffix() !== piece.stamp
    );
    await this.stampDocuments(piecesToStamp);
  }

  async stampDocuments(pieces) {
    if (pieces.length === 0) {
      return;
    }

    if (pieces.some(piece => !piece.id)) {
      throw Error('Piece has no id, it might not have been saved yet.');
    }

    const pieceIds = pieces.map(piece => piece.id);

    const response = await fetch(`/document-stamping/documents/stamp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        documentIds: pieceIds,
      }),
    });
    const data = await response.json();
    if (response.ok && data) {
      if (data.message) {
        // TODO polling of the job, lowering toast timeout for now because it is covering a button in tests
        if (data.job) {
          this.toaster.loading(data.message, null, {
            timeOut: 1000,
          });
        } else {
          this.toaster.warning(data.message, null, {
            timeOut: 1000,
          });
        }
      }
    }
  }

  async stampDocumentsOfAgenda(agendaId) {
    const response = await fetch(
      `/document-stamping/agendas/${agendaId}/agendaitems/documents/stamp`,
      {
        method: 'POST',
      }
    );
    const data = await response.json();
    if (response.ok && data) {
      if (data.message) {
        // TODO polling of the job, lowering toast timeout for now because it is covering a button in tests
        if (data.job) {
          this.toaster.loading(data.message, null, {
            timeOut: 1000,
          });
        } else {
          this.toaster.warning(data.message, null, {
            timeOut: 1000,
          });
        }
      }
    }
  }
}
