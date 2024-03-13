import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { keepLatestTask, task, all, timeout } from 'ember-concurrency';
import {
  addPieceToAgendaitem,
  restorePiecesFromPreviousAgendaitem,
} from 'frontend-kaleidos/utils/documents';

export default class SubcaseDetailRegularComponent extends Component {
  @service agendaitemAndSubcasePropertiesSync;
  @service store;
  @service intl;
  @service router;
  @service fileConversionService;
  @service toaster;
  @service pieceAccessLevelService;

  @tracked decisionmakingFlow;
  @tracked mandatees;
  @tracked submitter;
  @tracked meeting;
  @tracked agenda;

  @keepLatestTask
  *ensureFreshData() {
    // piece is linked to a case at the piece-side,
    // so we don't need to reload this.args.case and this.args.case.pieces
    // we don't need to reload the subcase because we don't need to save it
    // Pieces are added on a submission activity, instead of directly on the subcase
    // Submission activities are related to subcase by means of the inverse relation
    // we don't need to reload subcase.agendaActivities nor subcase.submissionActivities
    // since we query them from the backend on addition of new pieces
  }

  @task
  *getAgendaActivity() {
    const latestAgendaActivity = yield this.store.queryOne('agenda-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'filter[agendaitems][agenda][created-for][:has-no:agenda]': true,
      sort: '-start-date',
    });

    return latestAgendaActivity;
  }

  @task
  *createSubmissionActivity(pieces, agendaActivity = null) {
    let submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      subcase: this.args.subcase,
      pieces,
      agendaActivity,
    });

    submissionActivity = yield submissionActivity.save();
    return submissionActivity;
  }

  @task
  *updateSubmissionActivity(pieces) {
    const submissionActivity = yield this.store.queryOne(
      'submission-activity',
      {
        'filter[subcase][:id:]': this.args.subcase.id,
        'filter[:has-no:agenda-activity]': true,
      }
    );

    if (submissionActivity) {
      // Adding pieces to existing submission activity
      const submissionPieces = yield submissionActivity.pieces;
      submissionPieces.pushObjects(pieces);

      yield submissionActivity.save();
      return submissionActivity;
    } else {
      // Create first submission activity to add pieces on
      return this.createSubmissionActivity.perform(pieces);
    }
  }

  @task
  *updateRelatedAgendaitems(pieces) {
    // Link piece to all agendaitems that are related to the subcase via an agendaActivity
    // and related to an agenda in the design status
    const agendaitems = yield this.store.query('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
    });

    // agendaitems can only have more than 1 item
    // in case the subcase is on multiple (future) open agendas
    for (const agendaitem of agendaitems.toArray()) {
      setNotYetFormallyOk(agendaitem);
      // save prior to adding pieces, micro-service does all the changes with docs
      yield agendaitem.save();
      for (const piece of pieces) {
        yield addPieceToAgendaitem(agendaitem, piece);
      }
      // ensure the cache does not hold stale data + refresh our local store for future saves of agendaitem
      for (let index = 0; index < 10; index++) {
        const agendaitemPieces = yield agendaitem.hasMany('pieces').reload();
        if (agendaitemPieces.includes(pieces[pieces.length - 1])) {
          // last added piece was found in the list from cache
          break;
        } else {
          // list from cache is stale, wait with back-off strategy
          yield timeout(500 + index * 500);
          if (index >= 9) {
            this.toaster.error(
              this.intl.t('documents-may-not-be-saved-message'),
              this.intl.t('warning-title'),
              {
                timeOut: 60000,
              }
            );
          }
        }
      }
    }
    this.router.refresh('cases.case.subcases.subcase');
  }

  @action
  async openBatchDetails() {
    await this.ensureFreshData.perform();
    this.isOpenBatchDetailsModal = true;
  }

  @action
  cancelBatchDetails() {
    this.isOpenBatchDetailsModal = false;
  }

  @action
  saveBatchDetails() {
    this.router.refresh('cases.case.subcases.subcase');
    this.isOpenBatchDetailsModal = false;
  }

  @action
  refresh() {
    this.router.refresh('cases.case.subcases.subcase');
  }
}
