import Component from '@glimmer/component';
import { later, cancel } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS } from 'frontend-kaleidos/config/config';


export default class AgendaAgendaHeaderPublicationPillsComponent extends Component {
  @service store;
  @service currentSession;

  @tracked latestThemisNewsitemPublicationActivity;
  @tracked retractedThemisNewsitemPublicationActivity;
  @tracked mailCampaign;
  @tracked latestBelgaPublication;

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
  loadInitialData = task(async () => {
    await this.loadPublicationActivities.perform();
  });

  loadPublicationActivities = task(async () => {
    if (!this.currentSession.may('manage-news-items')) {
      return;
    }
    await timeout(500); // some cache calls could be still incorrect after publishing

    // there should only be one mail-campaign
    this.mailCampaign = await this.store.queryOne('mail-campaign', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      sort: '-sent-at',
    });

    // there should only be one belga-publication
    this.latestBelgaPublication = await this.store.queryOne('belga-publication', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      sort: '-sent-at',
    });

    // this also contains the double scoped one. which will not be released yet.
    // sorting on undefined startDate yields unexpected results
    const allThemisNewsitemPublicationActivities = await this.store.queryAll('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': 'newsitems',
      include: 'status',
    });
    this.latestThemisNewsitemPublicationActivity =  allThemisNewsitemPublicationActivities
      .slice()
      .filter((a) => a.startDate)
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);

    // check if the newsitems weren't retracted at a later time
    this.retractedThemisNewsitemPublicationActivity = await this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[:has-no:scope]': 't',
      sort: '-start-date',
      include: 'status',
    });

    this.schedulePublicationActivitiesRefresh();
  });
}
