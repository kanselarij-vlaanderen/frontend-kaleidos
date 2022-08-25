import Component from '@glimmer/component';
import { later, cancel } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS } from 'frontend-kaleidos/config/config';


export default class AgendaAgendaHeaderPublicationPillsComponent extends Component {
  @service store;
  @service currentSession;

  @tracked latestThemisPublicationActivity;

  constructor() {
    super(...arguments);
    this.loadInitialData.perform();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    cancel(this.scheduledRefresh);
  }

  get mayManageDecisionPublications() {
    return this.currentSession.may('manage-decision-publications');
  }

  get mayManageDocumentPublications() {
    return this.currentSession.may('manage-document-publications');
  }

  get mayManageThemisPublications() {
    return this.currentSession.may('manage-themis-publications');
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
    const decisionPublicationActivity = yield this.args.meeting.belongsTo('internalDecisionPublicationActivity').reload();
    yield decisionPublicationActivity?.belongsTo('status').reload();
    const documentPublicationActivity = yield this.args.meeting.belongsTo('internalDocumentPublicationActivity').reload();
    yield documentPublicationActivity?.belongsTo('status').reload();

    this.latestThemisPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      sort: '-start-date',
      include: 'status',
    });

    this.schedulePublicationActivitiesRefresh();
  }
}
