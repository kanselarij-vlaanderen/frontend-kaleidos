import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import CopyErrorToClipboardToast from 'frontend-kaleidos/components/utils/toaster/copy-error-to-clipboard-toast';
import { all } from 'ember-concurrency';

export default class DocumentService extends Service {
  @service jobMonitor;
  @service store;
  @service toaster;
  @service intl;

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
        if (data.job) {
          const stampingJob = await this.store.findRecord('job', data.job.id);
          const stampingToaster = this.toaster.loading(data.message, null, {
            timeOut: 60000,
          });
          await this.handleStampingErrors(stampingJob, stampingToaster);
        } else {
          this.toaster.warning(data.message, null, {
            timeOut: 5000,
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
        if (data.job) {
          const stampingJob = await this.store.findRecord('job', data.job.id);
          const stampingToaster = this.toaster.loading(data.message, null, {
            timeOut: 60000,
          });
          await this.handleStampingErrors(stampingJob, stampingToaster);
        } else {
          this.toaster.warning(data.message, null, {
            timeOut: 5000,
          });
        }
      }
    }
  }

  async setGeneratedPieceNames(agendaId, mapping, timestamp) {
    if (!mapping) {
      // should be unreachable but just a failsafe, in this stage the agenda was already approved.
      throw new Error(this.intl.t('error-while-sending-document-naming-mapping'));
    }
    const response = await fetch(
      `/document-naming/agenda/${agendaId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/vnd.api+json' },
        body: JSON.stringify({
          clientUpdateTimestamp: timestamp,
          data: Array.from(mapping.entries())
                    .map(([uri, generatedName]) => ({ uri, generatedName })),
        }),
      }
    );
    const json = await response.json();
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    // TODO: this only deals with successful jobs, we need to handle errors as well
    if (json?.data?.id) {
      const job = await this.store.findRecord('job', json.data.id);
      if (mapping.size) {
        const namingToaster = this.toaster.loading(
          this.intl.t('document-naming--toast-generating--message'),
          null,
          {
            timeOut: 60000,
            closable: false,
          }
        );
        await this.jobMonitor.register(job);
        setTimeout(() => {
          this.toaster.close(namingToaster);
        }, 2000);
      } else {
        this.toaster.warning(
          this.intl.t('no-document-naming-needed'),
          null,
          {
            timeOut: 5 * 1000,
          }
        );
      }
    } else {
      throw new Error(this.intl.t('error-while-searching-document-naming-job'));
    }
  };

  async moveDraftFile(fileId) {
    const response = await fetch(
      `/draft-files/${fileId}/move`,
      {
        method: 'POST',
        headers: { 'Accept': 'application/vnd.api+json' },
      }
    );
    const json = await response.json();
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (json?.data?.id) {
      const file = await this.store.findRecord('file', json.data.id);
      return file;
    } else {
      throw new Error('Could not find moved file');
    }
  }

  async handleStampingErrors(job, toasterToClose) {
    await this.jobMonitor.register(job, async (job) => {
      setTimeout(() => {
        this.toaster.close(toasterToClose);
      }, 2000);
      if (job.status === job.SUCCESS) {
        this.toaster.success(
          this.intl.t('succes-stamping-documents'),
        );
      } else {
        this.toaster.show(CopyErrorToClipboardToast, {
          title: this.intl.t('warning-title'),
          message: this.intl.t('error-while-stamping-document'),
          errorContent: job.message,
          showDatetime: true,
          options: {
            timeOut: 60 * 10 * 1000,
          },
        });
      }
    });
  }

  async enforceDocType(pieces) {
    if (pieces?.length) {
      // enforce all new pieces must have type on document container
      const typesPromises = pieces.map(async (piece) => {
        const container = await piece.documentContainer;
        const type = await container.type;
        return type;
      });
      const types = await all(typesPromises);
      if (types.some(type => !type)) {
        this.toaster.error(
          this.intl.t('document-type-required'),
          this.intl.t('warning-title'),
        );
        return true;
      }
    }
    return false;
  }
}
