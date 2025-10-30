import Component from '@glimmer/component';
import { later, cancel } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS } from 'frontend-kaleidos/config/config';


export default class AgendaAgendaHeaderPublicationPillsComponent extends Component {
  @service store;

  @tracked latestThemisNewsitemPublicationActivity;
  @tracked latestThemisDocumentPublicationActivity;
  @tracked retractedThemisNewsitemPublicationActivity;
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

  get isReleasedThemisDocumentPublicationActivity() {
    return this.latestThemisDocumentPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
  }

  get isReleasedThemisNewsitemPublicationActivity() {
    return this.latestThemisNewsitemPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
  }

  get isConfirmedThemisDocumentPublicationActivity() {
    return this.latestThemisDocumentPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.CONFIRMED;
  }

  // when we retract everything, we publish a new publicationActivity with empty scope
  get isRetractedThemisNewsitemPublicationActivity() {
    return this.latestThemisNewsitemPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED &&
      this.retractedThemisNewsitemPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED &&
      this.latestThemisNewsitemPublicationActivity?.startDate < this.retractedThemisNewsitemPublicationActivity?.startDate;
  }

  // when we retract only documents, we publish a new publicationActivity with scope "newsitems"
  get isRetractedThemisDocumentPublicationActivity() {
    return this.latestThemisNewsitemPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED &&
      this.latestThemisDocumentPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED &&
      (
        this.latestThemisDocumentPublicationActivity?.startDate < this.latestThemisNewsitemPublicationActivity?.startDate ||
        this.latestThemisDocumentPublicationActivity?.startDate < this.retractedThemisNewsitemPublicationActivity?.startDate
      );
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

    this.latestThemisNewsitemPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': 'newsitems',
      sort: '-start-date',
      include: 'status',
    });

    this.latestThemisDocumentPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': 'documents',
      sort: '-start-date',
      include: 'status',
    });

    // check if the newsitems weren't retracted at a later time
    this.retractedThemisNewsitemPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[:has-no:scope]': 't',
      sort: '-start-date',
      include: 'status',
    });

    this.schedulePublicationActivitiesRefresh();
  }
}
