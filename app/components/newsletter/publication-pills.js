import Component from '@glimmer/component';
import { later, cancel } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS } from 'frontend-kaleidos/config/config';


export default class AgendaAgendaHeaderPublicationPillsComponent extends Component {
  @service store;
  @service currentSession;

  @tracked latestThemisNewsitemPublicationActivity;
  @tracked retractedThemisNewsitemPublicationActivity;
  @tracked mailCampaign;
  @tracked belgaPublication;

  constructor() {
    super(...arguments);
    this.loadInitialData.perform();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    cancel(this.scheduledRefresh);
  }

  get isReleasedThemisNewsitemPublicationActivity() {
    return this.latestThemisNewsitemPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
  }

  // when we retract everything, we publish a new publicationActivity with empty scope
  get isRetractedThemisNewsitemPublicationActivity() {
    return this.latestThemisNewsitemPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED &&
      this.retractedThemisNewsitemPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED &&
      this.latestThemisNewsitemPublicationActivity?.startDate < this.retractedThemisNewsitemPublicationActivity?.startDate;
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
    if (!this.currentSession.may('manage-news-items')) {
      return;
    }
    yield timeout(500); // some cache calls could be still incorrect after publishing

    // there should only be one mail-campaign
    this.mailCampaign = yield this.store.queryOne('mail-campaign', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      sort: '-sent-at',
    });

    // there should only be one belga-publication
    this.belgaPublication = yield this.store.queryOne('belga-publication', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      sort: '-sent-at',
    });

    // this also contains the double scoped one. which will not be released yet.
    this.latestThemisNewsitemPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': 'newsitems',
      sort: '-start-date', // this sorting can give issues with undefined
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
