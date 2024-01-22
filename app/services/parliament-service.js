import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import CopyErrorToClipboardToast from 'frontend-kaleidos/components/utils/toaster/copy-error-to-clipboard-toast';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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
  }

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
  }

  async sendToVP(agendaitem, pieces, comment, isComplete) {
    const sendingToast = this.toaster.loading(
      this.intl.t('the-files-are-being-sent-to-parliament'),
      null,
      {
        timeOut: 10 * 60 * 1000,
      }
    );
    const params = {
      agendaitem: agendaitem.uri,
      pieces: pieces.map((piece) => piece.uri),
      isComplete,
      ...(comment ? { comment } : null),
    };
    const response = await fetch(`/vlaams-parlement-sync/`, {
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
      method: 'POST',
      body: JSON.stringify(params),
    });
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
      this.toaster.close(sendingToast);
      this.toaster.show(CopyErrorToClipboardToast, {
        title: this.intl.t('warning-title'),
        message: this.intl.t('error-while-sending-to-VP-message'),
        errorContent: errorMessage,
        showDatetime: true,
        options: {
          timeOut: 60 * 10 * 1000,
        },
      });
    } else {
      const job = await response.json();
      this.delayedPoll(job, sendingToast);
    }
  }

  async delayedPoll(job, toast) {
    // Many files will only take about half a second to send
    // This avoids having to wait 2 seconds until the next poll
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.pollSendToVpJob(job, toast);
  }

  async pollSendToVpJob(job, toast) {
    const {
      data: { attributes: jobResult },
    } = await this.getJob(job, 'send-to-vp-job');
    if (!jobResult) {
      return;
    }

    if (jobResult.status === CONSTANTS.VP_JOB_STATUSES.SUCCESS) {
      this.toaster.close(toast);
      this.toaster.success(
        this.intl.t('the-files-are-sent-to-parliament'),
        null,
        {
          closable: true,
          timeOut: 5 * 1000,
        }
      );
    } else if (jobResult.status === CONSTANTS.VP_JOB_STATUSES.FAILED) {
      this.toaster.close(toast);
      this.toaster.error(
        this.intl.t('error-while-sending-to-VP-message')
      );
    } else {
      setTimeout(() => {
        this.pollSendToVpJob(job, toast);
      }, 2000);
    }
  }

  async getJob(job) {
    let response;
    try {
      response = await fetch(`/vlaams-parlement-sync/send-to-vp-jobs/${job.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `Backend response contained an error (status: ${
            response.status
          }): ${JSON.stringify(data)}`
        );
      }
      return data;
    } catch (error) {
      // Errors returned from services *should* still
      // be valid JSON(:API), but we could encounter
      // non-JSON if e.g. a service is down. If so,
      // throw a nice error that only contains the
      // response status.
      if (error instanceof SyntaxError) {
        throw new Error(
          `Backend response contained an error (status: ${response.status})`
        );
      } else {
        throw error;
      }
    }
  }
}
