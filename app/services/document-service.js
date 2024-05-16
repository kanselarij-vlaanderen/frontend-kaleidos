import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';

export default class DocumentService extends Service {
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
        if (data.job) {
          this.toaster.loading(
            data.message,
            null,
            {
              timeOut: 10 * 30 * 1000,
            }
          );
        } else {
          this.toaster.warning(
            data.message,
            null,
            {
              timeOut: 10 * 30 * 1000,
            }
          );
        }
      }
    }
  }
}
