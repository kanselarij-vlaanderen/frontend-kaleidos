import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import CopyErrorToClipboardToast from 'frontend-kaleidos/components/utils/toaster/copy-error-to-clipboard-toast';

export default class ParliamentService extends Service {
  @service toaster;
  @service intl;

  async isReadyForVp(agendaitem) {
    const resp = await fetch(
      `/vlaams-parlement-sync/is-ready-for-vp/?uri=${agendaitem.uri}`,
      { headers: { Accept: 'application/vnd.api+json' } }
    );
    if (!resp.ok) {
      return false;
    } else {
      const body = await resp.json();
      return body.isReady;
    }
  };

  async getPiecesReadyToBeSent(agendaitem) {
    const resp = await fetch(
      `/vlaams-parlement-sync/pieces-ready-to-be-sent/?uri=${agendaitem.uri}`,
      { headers: { Accept: 'application/vnd.api+json' } }
    );
    if (!resp.ok) {
      return { ready: [], missing: [] };
    } else {
      const body = await resp.json();
      return body.data;
    }
  };

  async sendToVP(agendaitem, pieces, comment, isComplete) {
    const params = new URLSearchParams({
      agendaitem: agendaitem.uri,
      pieces: pieces.map(piece => piece.uri),
      isComplete: isComplete,
      ...(comment ? { comment: comment } : null),
    });
    const response = await fetch(
      `/vlaams-parlement-sync/?${params}`,
      { headers: { Accept: 'application/vnd.api+json' }, method: 'POST' }
    );

    if (!response.ok) {
      let errorMessage = '';
      try {
        const data = await response.json();
        if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = JSON.stringify(data);
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          errorMessage = response.status;
        } else {
          errorMessage = `Something went wrong while reading response: ${error}`;
        }
      }
      this.toaster.show(CopyErrorToClipboardToast, {
        title: this.intl.t('warning-title'),
        message: this.intl.t('error-while-sending-to-VP-message'),
        errorContent: errorMessage,
        showDatetime: true,
        options: {
          timeOut: 60 * 10 * 1000,
        }
      });
    } else {
      this.toaster.success(this.intl.t('case-was-sent-to-VP'));
    }
  }
}
