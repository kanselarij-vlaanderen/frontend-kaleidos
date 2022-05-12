import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class AgendaHeader extends Component {
  /**
   * The header component when viewing a meeting and it's agendas.
   *
   * @argument meeting: the viewed meeting
   * @argument currentAgenda: the selected agenda
   * @argument reverseSortedAgendas: the agendas of the meeting, reverse sorted on serial number
   * @argument refreshRoute: a callback to parent route to refresh the model
   * @argument onStartLoading
   * @argument onStopLoading
   */
  @service currentSession;
  @service intl;
  @service store;

  @tracked loadingMessage = null;
  @tracked showLoadingOverlay = false;
  @tracked latestPublicationActivity;

  constructor() {
    super(...arguments);
    this.loadLatestPublicationActivity.perform();
  }

  get canPublishThemis() {
    return (
      this.currentSession.isEditor &&
      this.args.meeting.isFinal &&
      this.args.meeting.releasedDocuments
    );
  }

  get isAlreadyPublished() {
    return this.latestPublicationActivity != null;
  }

  /**
   * This method will toggle a modal component with a custom message
   * message = null will instead show a default message in the loader, and clear the local state of the message
   * @param {String} message: the message to show. If given, the text " even geduld aub..." will always be appended
   */
  @action
  setLoadingMessage(message) {
    if (message) {
      this.loadingMessage = `${message} ${this.intl.t(
        'please-be-patient'
      )}`;
    } else {
      this.loadingMessage = null;
    }
    this.args.onStartLoading(); // hides the agenda overview/sidebar
    this.showLoadingOverlay = true; // blocks the use of buttons
  }

  @action
  clearLoadingMessage() {
    this.loadingMessage = null;
    this.showLoadingOverlay = false;
    this.args.onStopLoading();
  }

  @task
  *loadLatestPublicationActivity() {
    this.latestPublicationActivity = yield this.store.queryOne(
      'themis-publication-activity',
      {
        sort: '-start-date',
        'filter[meeting][:uri:]': this.args.meeting.uri,
      }
    );
  }
}
