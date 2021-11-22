import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

export default class PublishService extends Service {
  scopes = [
    new ExportScope({ label: 'documenten', value: 'documents', includeInExport: false }),
    new ExportScope({ label: 'nieuwsberichten', value: 'newsitems', includeInExport: true })
  ];

  @service store;
  @service toaster;
  @service intl;


  async publishMeeting(meeting) {
    this.scopes.forEach(scope => scope.includeInExport = true);
    await this.postItems(meeting);
    this.toaster.success(this.intl.t('publish-docs-success'));
  }

  async publishNewsletter(meeting) {
    await this.postItems(meeting);
    this.toaster.success(this.intl.t('publish-newsletter-success'));
  }

  async unpublish(meeting) {
    this.scopes.forEach(scope => scope.includeInExport = false);
    await this.postItems(meeting);
    this.toaster.success(this.intl.t('unpublish-success'));
  }

  async postItems(meeting) {
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
      throw new Error(this.intl.t('publish-error'));
    }
  }


}
