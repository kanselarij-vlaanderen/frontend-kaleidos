import { tracked } from '@glimmer/tracking';
import  { inject as service } from '@ember/service';

class ExportScope {
  @tracked label;
  @tracked value;
  @tracked includeInExport;

  constructor({ label, value, includeInExport }) {
    this.label = label;
    this.value = value;
    this.includeInExport = includeInExport;
  }
}

class ThemisPublisher {
  @service intl;

  scopes = [
    new ExportScope({ label: 'documenten', value: 'documents', includeInExport: false }),
    new ExportScope({ label: 'nieuwsberichten', value: 'newsitems', includeInExport: true })
  ];

  async publishDocuments(meeting) {
    this.scopes.forEach(scope => scope.includeInExport = true);
    await this.createPublicationActivity(meeting);
  }

  async publishNewsitems(meeting) {
    await this.createPublicationActivity(meeting);
  }

  async unpublish(meeting) {
    this.scopes.forEach(scope => scope.includeInExport = false);
    await this.createPublicationActivity(meeting);
  }

  /**
   * @private
   */
  async createPublicationActivity(meeting) {
    const response = await fetch(`/meetings/${meeting.id}/publication-activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: 'publication-activity',
          attributes: {
            scope: this.scopes
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(this.intl.t('publish-themis-error'));
    }
  }
}
export default ThemisPublisher;
