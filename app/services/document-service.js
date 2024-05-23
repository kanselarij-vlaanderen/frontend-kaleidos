import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';

export default class DocumentService extends Service {
  @service jobMonitor;
  @service store;
  @service toaster;

  async stampDocuments(agendaId) {
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
          this.toaster.loading(
            data.message,
            null,
            {
              timeOut: 1000,
            }
          );
        } else {
          this.toaster.warning(
            data.message,
            null,
            {
              timeOut: 1000,
            }
          );
        }
      }
    }
  }

  async setGeneratedPieceNames(agendaId, mapping, timestamp) {
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
      await this.jobMonitor.register(job);
    } else {
      throw new Error('Could not find job for generating piece names');
    }
  };
}
