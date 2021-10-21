import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { task } from 'ember-concurrency-decorators';
import moment from 'moment';
import { all } from 'rsvp';

import { setAgendaitemFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob,
} from 'frontend-kaleidos/utils/zip-agenda-files';

export default class MeetingHeader extends Component {
  /**
   * The header component when viewing a meeting and it's agendas.
   *
   * @argument meeting: the viewed meeting
   * @argument currentAgenda: the selected agenda
   * @argument reversedAgendas: the agendas of the meeting, reverse sorted on serial number
   * @argument refreshRoute: a callback to parent route to refresh the model
   */
  @service store;
  @service router;
  // This can be confusing, currentSession is for checking user profile here and not to reference the meeting
  @service currentSession;
  @service intl;
  @service jobMonitor;
  @service toaster;

  @tracked isAddingAgendaitems = false;
  @tracked isEditingSession = false;
  @tracked showConfimApprovingAllAgendaitems = false;
  @tracked showConfirmReleaseDecisions = false;
  @tracked showConfirmReleaseDocuments = false;
  @tracked showLoadingOverlay = false;
  @tracked loadingMessage = null;

  get showPrintButton() {
    return this.router.currentRouteName === 'agenda.print';
  }

  get canEditDesignAgenda() {
    return (
      this.currentSession.isEditor && this.args.currentAgenda.isDesignAgenda
    );
  }

  get canReleaseDecisions() {
    return (
      this.currentSession.isEditor &&
      this.args.meeting.isFinal &&
      !this.args.meeting.releasedDecisions
    );
  }

  get canReleaseDocuments() {
    return (
      this.currentSession.isEditor &&
      this.args.meeting.isFinal &&
      !this.args.meeting.releasedDocuments
    );
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
    const agendaitemsNotOk = yield this.args.currentAgenda.get(
      'allAgendaitemsNotOk'
    );
    for (const agendaitem of agendaitemsNotOk) {
      // Reloading some relationships of agendaitem most likely to be changed by concurrency
      yield agendaitem.reload();
      yield agendaitem.hasMany('pieces').reload();
      yield agendaitem.hasMany('treatments').reload();
      yield agendaitem.hasMany('mandatees').reload();
      yield agendaitem.hasMany('approvals').reload();
      yield agendaitem.hasMany('linkedPieces').reload();
    }
  }

  /**
   * This method will toggle a modal component with a custom message
   * message = null will instead show a default message in the loader, and clear the local state of the message
   * @param {String} message: the message to show. If given, the text " even geduld aub..." will always be appended
   */
  @action
  toggleLoadingMessage(message) {
    if (message) {
      this.loadingMessage = `${message} ${this.intl.t(
        'please-be-patient'
      )}`;
    } else {
      this.loadingMessage = null;
    }
    this.args.loading(); // hides the agenda overview/sidebar
    this.showLoadingOverlay = !this.showLoadingOverlay; // blocks the use of buttons
  }

  @action
  openConfirmReleaseDecisions() {
    this.showConfirmReleaseDecisions = true;
  }

  @action
  cancelReleaseDecisions() {
    this.showConfirmReleaseDecisions = false;
  }

  @action
  releaseDecisions() {
    this.showConfirmReleaseDecisions = false;
    this.args.meeting.releasedDecisions = moment().utc().toDate();
    this.args.meeting.save();
  }

  @action
  openConfirmReleaseDocuments() {
    this.showConfirmReleaseDocuments = true;
  }

  @action
  cancelReleaseDocuments() {
    this.showConfirmReleaseDocuments = false;
  }

  @action
  releaseDocuments() {
    this.showConfirmReleaseDocuments = false;
    this.args.meeting.releasedDocuments = moment().utc().toDate();
    this.args.meeting.save();
  }

  @action
  toggleEditingSession() {
    this.isEditingSession = !this.isEditingSession;
  }

  @action
  print() {
    window.print();
  }

  @action
  openConfirmApproveAllAgendaitems() {
    this.reloadAgendaitemsData.perform();
    this.showConfimApprovingAllAgendaitems = true;
  }

  @action
  cancelApproveAllAgendaitems() {
    this.showConfimApprovingAllAgendaitems = false;
  }

  @action
  async approveAllAgendaitems() {
    this.showConfimApprovingAllAgendaitems = false;
    this.toggleLoadingMessage(
      this.intl.t('approve-all-agendaitems-message')
    );
    const allAgendaitemsNotOk = await this.args.currentAgenda.get(
      'allAgendaitemsNotOk'
    );
    for (const agendaitem of allAgendaitemsNotOk) {
      try {
        await setAgendaitemFormallyOk(agendaitem);
      } catch {
        await agendaitem.rollbackAttributes();
      }
    }
    this.toggleLoadingMessage(null);
    this.args.refreshRoute();
  }

  @action
  openAddAgendaitemsModal() {
    this.isAddingAgendaitems = true;
  }

  @action
  async downloadAllDocuments() {
    // timeout options is in milliseconds. when the download is ready, the toast should last very long so users have a time to click it
    const fileDownloadToast = {
      title: this.intl.t('file-ready'),
      type: 'download-file',
      options: {
        timeOut: 60 * 10 * 1000,
      },
    };

    const namePromise = constructArchiveName(this.args.currentAgenda);
    debug('Checking if archive exists ...');
    const jobPromise = fetchArchivingJobForAgenda(
      this.args.currentAgenda,
      this.store
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
      this.jobMonitor.register(job);
      job.on('didEnd', this, async function (status) {
        if (this.toaster.toasts.includes(inCreationToast)) {
          this.toaster.toasts.removeObject(inCreationToast);
        }
        if (status === job.SUCCESS) {
          const url = await fileDownloadUrlFromJob(job, name);
          debug(`Archive ready. Prompting for download now (${url})`);
          fileDownloadToast.options.downloadLink = url;
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
      fileDownloadToast.options.downloadLink = url;
      fileDownloadToast.options.fileName = name;
      this.toaster.displayToast.perform(fileDownloadToast);
    }
  }
}
