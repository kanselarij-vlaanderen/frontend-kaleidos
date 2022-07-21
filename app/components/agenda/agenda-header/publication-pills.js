import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaAgendaHeaderPublicationPillsComponent extends Component {
  @service store;

  @tracked latestThemisPublicationActivity;

  constructor() {
    super(...arguments);
    this.loadPublicationActivities.perform();

    // TODO add polling to refresh data
  }

  get isConfirmedDocumentPublicationPlanning() {
    return this.args.meeting.internalDocumentPublicationActivity.get('status.uri') == CONSTANTS.RELEASE_STATUSES.CONFIRMED;
  }

  get isReleasedThemisPublicationActivity() {
    return this.latestThemisPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
  }

  get isConfirmedThemisPublicationActivity() {
    return this.latestThemisPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.CONFIRMED;
  }

  get themisPublicationIncludesDocuments() {
    return this.latestThemisPublicationActivity?.scope.includes(CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS);
  }

  @task
  *loadPublicationActivities() {
    const decisionPublicationActivity = yield this.args.meeting.internalDecisionPublicationActivity;
    yield decisionPublicationActivity.status;
    const documentPublicationActivity = yield this.args.meeting.internalDocumentPublicationActivity;
    yield documentPublicationActivity.status;

    this.latestThemisPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      sort: '-start-date',
    });
  }
}
