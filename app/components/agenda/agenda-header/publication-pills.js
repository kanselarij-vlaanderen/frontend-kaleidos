import Component from '@glimmer/component';
import { later, cancel } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS } from 'frontend-kaleidos/config/config';


export default class AgendaAgendaHeaderPublicationPillsComponent extends Component {
  @service store;

  @tracked latestThemisPublicationActivity;
  @tracked internalDecisionPublicationActivity;
  @tracked internalDocumentPublicationActivity;

  constructor() {
    super(...arguments);
    this.loadInitialData.perform();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    cancel(this.scheduledRefresh);
  }

  get isConfirmedDocumentPublicationPlanning() {
    return this.internalDocumentPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.CONFIRMED;
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

  schedulePublicationActivitiesRefresh() {
    this.scheduledRefresh = later(this, () => this.loadPublicationActivities.perform(), PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS);
  }

  // Seperate task to make a distinction in the template
  // between the initial data loading  and subsequent (background) data reloads
  @task
  *loadInitialData() {
    yield this.loadPublicationActivities.perform();
  }

  @task
  *loadPublicationActivities() {
    this.internalDocumentPublicationActivity = yield this.store.queryOne('internal-document-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      include: 'status',
    });

    this.internalDecisionPublicationActivity = yield this.store.queryOne('internal-decision-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      include: 'status',
    });

    this.latestThemisPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      sort: '-start-date',
      include: 'status',
    });

    this.schedulePublicationActivitiesRefresh();
  }
}
