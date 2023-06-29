import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob,
} from 'frontend-kaleidos/utils/zip-agenda-files';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import bind from 'frontend-kaleidos/utils/bind';
import { isPresent } from '@ember/utils';

/**
 * @argument {Meeting} meeting
 * @argument {Agenda} currentAgenda
 * @argument {function} didApproveAgendaitems
 * @argument onStartLoading
 * @argument onStopLoading
 */
export default class AgendaAgendaHeaderAgendaActions extends Component {
  @service store;
  @service router;
  @service currentSession;
  @service intl;
  @service jobMonitor;
  @service toaster;

  downloadOptions = [
    {
      label: this.intl.t('document-type-pdf-only'),
      value: 'pdf',
    },
    {
      label: this.intl.t('all-filetypes'),
      value: 'all',
    },
  ];

  @tracked isAddingAgendaitems = false;
  @tracked isEditingMeeting = false;
  @tracked showConfirmApprovingAllAgendaitems = false;
  @tracked showConfirmPublishDecisions = false;
  @tracked showPlanDocumentPublicationModal = false;
  @tracked showConfirmPublishThemis = false;
  @tracked showConfirmUnpublishThemis = false;
  @tracked showDownloadDocuments = false;
  @tracked selectedMandatees = [];
  @tracked showDownloadDecisions = false;

  @tracked decisionPublicationActivity;
  @tracked documentPublicationActivity;
  @tracked themisPublicationActivity;
  @tracked latestThemisPublicationActivity;

  @tracked downloadOption = this.downloadOptions[0].value;

  constructor() {
    super(...arguments);
    this.loadPublicationActivities.perform();
  }

  get selectedDownloadOption() {
    return this.downloadOption;
  }

  get showPrintButton() {
    return this.router.currentRouteName === 'agenda.print';
  }

  get canEditDesignAgenda() {
    return this.currentSession.may('manage-agendaitems') && this.args.currentAgenda.status.get('isDesignAgenda');
  }

  get canPublishDecisions() {
    return (
      this.currentSession.may('manage-decision-publications') &&
      this.isFinalMeeting &&
      this.decisionPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.PLANNED
    );
  }

  get canPlanDocumentPublication() {
    const mayManagePublication = this.currentSession.may('manage-document-publications') || this.currentSession.may('manage-themis-publications');
    // With slow network, it's possible to open the planning modal when the task is running resulting in errors
    const loadingActivities = this.loadPublicationActivities.isRunning;
    // get('uri') will immediately resolve since we preloaded the statuses
    // in loadPublicationActivities()
    const documentsNotYetReleased = [
      this.documentPublicationActivity?.status,
      this.themisPublicationActivity?.status,
    ].some((status) => status?.get('uri') != CONSTANTS.RELEASE_STATUSES.RELEASED);

    return mayManagePublication && !loadingActivities && this.isFinalMeeting && documentsNotYetReleased;
  }

  get canPublishThemis() {
    // get('uri') will immediately resolve since we preloaded the statuses
    // in loadPublicationActivities()
    const documentsAlreadyReleased = this.documentPublicationActivity?.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;

    return this.currentSession.may('manage-themis-publications') &&
      this.isFinalMeeting &&
      documentsAlreadyReleased;
  }

  get canUnpublishThemis() {
    return this.currentSession.may('manage-themis-publications') &&
      this.isFinalMeeting &&
      this.latestThemisPublicationActivity != null;
  }

  // Themis publication from the agenda-side always publishes both, newsitems and documents
  get themisPublicationScopes() {
    return [
      CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS,
      CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS
    ];
  }

  get isFinalMeeting() {
    return isPresent(this.args.meeting.agenda.get('id'));
  }

  @bind
  async allAgendaitemsNotOk() {
    const agendaitems = await this.args.currentAgenda.agendaitems;
    return agendaitems
      .filter((agendaitem) => [CONSTANTS.ACCEPTANCE_STATUSSES.NOT_OK, CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK].includes(agendaitem.formallyOk))
      .sortBy('number');
  }

  @task
  *loadPublicationActivities() {
    // Ensure we get fresh data to avoid concurrency conflicts
    this.decisionPublicationActivity = yield this.args.meeting.belongsTo('internalDecisionPublicationActivity').reload();
    yield this.decisionPublicationActivity?.status; // used in get-functions above
    this.documentPublicationActivity = yield this.args.meeting.belongsTo('internalDocumentPublicationActivity').reload();
    yield this.documentPublicationActivity?.status; // used in get-functions above
    // Documents can be published multiple times to Themis.
    // We're only interested in the first (earliest) publication.
    this.themisPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS,
      sort: 'planned-date',
      include: 'status'
    });

    this.latestThemisPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[status][:uri:]': CONSTANTS.RELEASE_STATUSES.RELEASED,
      sort: '-start-date',
    });
  }

  /**
   * This task will reload the agendaitems of the current agenda
   * Any new agendaitem or changed formality is picked up by this, to avoid stale data created by concurrent edits of agendaitem
   */
  @task
  *reloadAgendaitemsData() {
    /**
     * This hasMany reload will:
     * - Refresh the amount of agendaitems there are (if new were added)
     * - Reload the agendaitems attributes (titles, formal ok status (uri), etc)
     * - Reload the agendaitems concurrency (modified attribute)
     */
    yield this.args.currentAgenda.hasMany('agendaitems').reload();
    // When reloading the data for this use-case, only the agendaitems that are not "formally ok" have to be fully reloaded
    // If not reloaded, any following PATCH call on these agendaitems will succeed (due to the hasMany reload above) but with old relation data
    // *NOTE* since we only load the "nok/not yet ok" items, it is still possible to save old relations on formally ok items (although most changes should reset the formality)
    const agendaitemsNotOk = yield this.allAgendaitemsNotOk(this.args.currentAgenda);
    for (const agendaitem of agendaitemsNotOk) {
      // Reloading some relationships of agendaitem most likely to be changed by concurrency
      yield agendaitem.reload();
      yield agendaitem.hasMany('pieces').reload();
      yield agendaitem.hasMany('mandatees').reload();
      yield agendaitem.hasMany('linkedPieces').reload();
    }
  }

  @action
  async publishDecisions() {
    const status = await this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.RELEASED);
    this.showConfirmPublishDecisions = false;
    this.decisionPublicationActivity.startDate = new Date();
    this.decisionPublicationActivity.status = status;
    await this.decisionPublicationActivity.save();
  }

  @task
  *planDocumentPublication(plannedActivities) {
    yield Promise.all(plannedActivities.map((activity) => activity.save()));
    yield this.loadPublicationActivities.perform();
    this.showPlanDocumentPublicationModal = false;
  }

  @task
  *publishThemis(scope) {
    try {
      const status = yield this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.RELEASED);
      const now = new Date();
      const themisPublicationActivity = this.store.createRecord('themis-publication-activity', {
        plannedDate: now,
        startDate: now,
        meeting: this.args.meeting,
        scope,
        status,
      });
      yield themisPublicationActivity.save();
      yield this.loadPublicationActivities.perform();
      this.toaster.success(this.intl.t('success-publish-to-web'));
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-publish-to-web'),
        this.intl.t('warning-title')
      );
    }
    this.showConfirmPublishThemis = false;
  }

  @task
  *unpublishThemis(scope) {
    try {
      const status = yield this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.RELEASED);
      const now = new Date();
      const themisPublicationActivity = this.store.createRecord('themis-publication-activity', {
        plannedDate: now,
        startDate: now,
        meeting: this.args.meeting,
        scope,
        status,
      });
      yield themisPublicationActivity.save();
      yield this.loadPublicationActivities.perform();
      this.toaster.success(this.intl.t('success-unpublish-from-web'));
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-unpublish-from-web'),
        this.intl.t('warning-title')
      );
    }
    this.showConfirmUnpublishThemis = false;
  }

  /**
   * @name setAgendaitemFormallyOkThrottled
   * @description set formally ok on agendaitems, throttled task.
   * @param agendaitem
   * @returns promise
   */
  @task({ maxConcurrency: 3, enqueue: true })
  *setAgendaitemFormallyOkThrottled(agendaitem) {
    if (agendaitem.formallyOk !== CONSTANTS.ACCEPTANCE_STATUSSES.OK) {
      agendaitem.formallyOk = CONSTANTS.ACCEPTANCE_STATUSSES.OK;
      return yield agendaitem.save();
    }
  }

  @action
  async downloadDocuments(decisions = false) {
    // timeout options is in milliseconds. when the download is ready, the toast should last very long so users have a time to click it
    const fileDownloadToast = {
      title: this.intl.t('file-ready'),
      message: this.intl.t('agenda-documents-download-ready'),
      type: 'download-file',
      options: {
        timeOut: 60 * 10 * 1000,
      },
    };
    const pdfOnly = this.downloadOption === 'pdf' ? true : false;
    const namePromise = constructArchiveName(this.args.currentAgenda);
    debug('Checking if archive exists ...');
    const jobPromise = fetchArchivingJobForAgenda(
      this.args.currentAgenda,
      this.selectedMandatees,
      decisions,
      this.store,
      pdfOnly
    );
    const [name, job] = await all([namePromise, jobPromise]);
    if (!job) {
      this.toaster.warning(
        this.intl.t('no-documents-to-download-warning-text'),
        this.intl.t('no-documents-to-download-warning-title'),
        {
          timeOut: 10000,
        }
      );
      return;
    }
    if (!job.hasEnded) {
      debug('Archive in creation ...');
      const inCreationToast = this.toaster.loading(
        this.intl.t('archive-in-creation-message'),
        this.intl.t('archive-in-creation-title'),
        {
          timeOut: 3 * 60 * 1000,
        }
      );
      this.jobMonitor.register(job, async (job) => {
        this.toaster.clear(inCreationToast);
        if (job.status === job.SUCCESS) {
          const url = await fileDownloadUrlFromJob(job, name);
          debug(`Archive ready. Prompting for download now (${url})`);
          fileDownloadToast.options.archiveLink = url;
          fileDownloadToast.options.fileName = name;
          this.toaster.displayToast.perform(fileDownloadToast);
        } else {
          debug('Something went wrong while generating archive.');
          this.toaster.error(
            this.intl.t('error'),
            this.intl.t('warning-title')
          );
        }
      });
    } else {
      const url = await fileDownloadUrlFromJob(job, name);
      debug(`Archive ready. Prompting for download now (${url})`);
      fileDownloadToast.options.archiveLink = url;
      fileDownloadToast.options.fileName = name;
      this.toaster.displayToast.perform(fileDownloadToast);
    }
  }

  @action
  async approveAllAgendaitems() {
    this.showConfirmApprovingAllAgendaitems = false;
    this.args.onStartLoading(this.intl.t('approve-all-agendaitems-message'));
    const agendaitemsNotOk = await this.allAgendaitemsNotOk(this.args.currentAgenda);
    const savePromises = agendaitemsNotOk.map((agendaitem) => this.setAgendaitemFormallyOkThrottled.perform(agendaitem));
    await all(savePromises);
    this.args.onStopLoading();
    this.args.didApproveAgendaitems();
  }

  @action
  print() {
    window.print();
  }

  @action
  openConfirmUnpublishThemis() {
    this.showConfirmUnpublishThemis = true;
  }

  @action
  cancelUnpublishThemis() {
    this.showConfirmUnpublishThemis = false;
  }

  @action
  openConfirmPublishDecisions() {
    this.showConfirmPublishDecisions = true;
  }

  @action
  cancelPublishDecisions() {
    this.showConfirmPublishDecisions = false;
  }

  @action
  openPlanDocumentPublicationModal() {
    this.showPlanDocumentPublicationModal = true;
  }

  @action
  cancelPlanDocumentPublication() {
    this.showPlanDocumentPublicationModal = false;
  }

  @action
  openConfirmPublishThemis() {
    this.showConfirmPublishThemis = true;
  }

  @action
  cancelPublishThemis() {
    this.showConfirmPublishThemis = false;
  }

  @action
  toggleEditingMeeting() {
    this.isEditingMeeting = !this.isEditingMeeting;
  }

  @action
  openDownloadDocuments() {
    this.showDownloadDocuments = true;
    this.selectedMandatees = [];
  }

  @action
  closeDownloadDocuments() {
    this.showDownloadDocuments = false;
    this.selectedMandatees = [];
  }

  @action
  async confirmDownloadDocuments() {
    await this.downloadDocuments();
    this.closeDownloadDocuments();
  }

  @action
  openDownloadDecisions() {
    this.showDownloadDecisions = true;
    this.selectedMandatees = [];
  }

  @action
  closeDownloadDecisions() {
    this.showDownloadDecisions = false;
    this.selectedMandatees = [];
  }

  @action
  async confirmDownloadDecisions() {
    await this.downloadDocuments(true);
    this.closeDownloadDecisions();
  }

  @action
  openConfirmApproveAllAgendaitems() {
    this.reloadAgendaitemsData.perform();
    this.showConfirmApprovingAllAgendaitems = true;
  }

  @action
  cancelApproveAllAgendaitems() {
    this.showConfirmApprovingAllAgendaitems = false;
  }

  @action
  openAddAgendaitemsModal() {
    this.isAddingAgendaitems = true;
  }

  @action
  closeAddAgendaitemsModal() {
    this.isAddingAgendaitems = false;
  }

  @action
  onChangeDownloadOption(selectedDownloadOption) {
    this.downloadOption = selectedDownloadOption;
  }
}
