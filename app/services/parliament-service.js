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
      return { ready: [], missing: [], required: [] };
    } else {
      const body = await resp.json();
      return body.data;
    }
  }

  async sendToVP(agendaitem, pieces, comment, isComplete) {
    const sendingToast = this.toaster.loading(
      this.intl.t('the-documents-are-being-sent-to-parliament'),
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
      this.closeToastAndError(sendingToast, errorMessage)
    } else {
      const job = await response.json();
      return { job, toast: sendingToast };
    }
    return {};
  }

  async relinkDecisionmakingFlow(decisionmakingFlow, _case, parliamentFlow) {
    const sendingToast = this.toaster.loading(
      this.intl.t('notifying-parliament-about-case-change'),
      null,
      {
        timeOut: 10 * 60 * 1000,
      }
    );
    const params = {
      decisionmakingFlowUri: decisionmakingFlow.uri,
      caseUri: _case.uri,
      parliamentFlowUri: parliamentFlow.uri,
    };
    const response = await fetch(`/vlaams-parlement-sync/relink-decisionmaking-flow`, {
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
      this.closeToastAndError(sendingToast, errorMessage)
    } else {
      this.toaster.close(sendingToast);
      this.toaster.success(
        this.intl.t('notified-parliament-about-case-change'),
        null,
        {
          closable: true,
          timeOut: 5 * 1000,
        }
      );
    }
  }

  async delayedPoll(job, toast) {
    // Many files will only take about half a second to send
    // This avoids having to wait 2 seconds until the next poll
    await new Promise((resolve) => setTimeout(resolve, 600));
    const MAX_RETRIES = 30;
    let retries = 0;
    let pollResult;
    while (!pollResult && retries < MAX_RETRIES) {
      pollResult = await this.pollSendToVpJob(job, toast);
      if (!pollResult) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    return pollResult;
  }

  async pollSendToVpJob(job, toast) {
    let jobResult;
    try {
      jobResult = await this.getJob(job, 'send-to-vp-job');
    } catch (error) {
      if (toast) {
        this.closeToastAndError(toast, error);
      }
      return true;
    }

    if (!jobResult) {
      return true;
    }

    if (jobResult.status === CONSTANTS.JOB_STATUSSES.SUCCESS) {
      if (toast) {
        this.toaster.close(toast);
        this.toaster.success(
          this.intl.t('the-documents-were-sent-to-parliament'),
          null,
          {
            closable: true,
            timeOut: 5 * 1000,
          }
        );
      }
      return true;
    } else if (jobResult.status === CONSTANTS.JOB_STATUSSES.FAILED) {
      if (toast) {
        this.closeToastAndError(toast, jobResult.errorMessage);
      }
      return true;
    }
    return false;
  }

  async getJob(job) {
    let response;
    try {
      response = await fetch(
        `/vlaams-parlement-sync/send-to-vp-jobs/${job.id}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `Backend response contained an error (status: ${
            response.status
          }): ${JSON.stringify(data)}`
        );
      }
      return data.data.attributes;
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

  closeToastAndError(toast, errorMessage) {
    this.toaster.close(toast);
    this.toaster.show(CopyErrorToClipboardToast, {
      title: this.intl.t('warning-title'),
      message: this.intl.t('error-while-sending-to-VP-message'),
      errorContent: errorMessage,
      showDatetime: true,
      options: {
        timeOut: 60 * 10 * 1000,
      },
    });
  }
}
