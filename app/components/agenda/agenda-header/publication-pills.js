import Component from '@glimmer/component';
import { later, cancel } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
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

    // sorting on undefined startDate yields unexpected results
    const allThemisNewsitemPublicationActivities = yield this.store.queryAll('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': 'newsitems',
      include: 'status',
    });
    this.latestThemisNewsitemPublicationActivity =  allThemisNewsitemPublicationActivities
      .slice()
      .filter((a) => a.startDate)
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);

    // sorting on undefined startDate yields unexpected results
    const allThemisDocumentPublicationActivities = yield this.store.queryAll('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': 'documents',
      include: 'status',
    });
    // 2 scenarios:
    // - we have 1 without a start-date between release of decisions and planned release of documents
    // - we have 1 or more released/retracted with start-dates (any new one has startDate of now)
    // - in both cases sorting on date should be fine.
    this.latestThemisDocumentPublicationActivity =  allThemisDocumentPublicationActivities
      .slice()
      // .filter((a) => a.startDate) // we also need to show "planned only" activities, which have no startDate
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);

    // check if the newsitems weren't retracted at a later time
    // sorting on undefined startDate here is fine, since scopeless activities always have a startDate
    this.retractedThemisNewsitemPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[:has-no:scope]': 't',
      sort: '-start-date',
      include: 'status',
    });

    this.schedulePublicationActivitiesRefresh();
  }
}
