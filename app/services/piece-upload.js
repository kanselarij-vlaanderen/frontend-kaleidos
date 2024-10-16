import Service, { inject as service } from '@ember/service';
import {
  task,
  timeout
} from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import { addObjects } from 'frontend-kaleidos/utils/array-helpers';
import { addPieceToAgendaitem } from 'frontend-kaleidos/utils/documents';

export default class PieceUploadService extends Service {
  @service intl;
  @service store;
  @service toaster;

  getAgendaActivity = async (subcase) => {
    return await this.store.queryOne('agenda-activity', {
      'filter[subcase][:id:]': subcase.id,
      'filter[agendaitems][agenda][created-for][:has-no:agenda]': true,
      sort: '-start-date',
    });
  }

  createSubmissionActivity = async (pieces, subcase, agendaActivity = null, submission = null) => {
    let submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      subcase,
      pieces,
      agendaActivity,
      submission
    });

    submissionActivity = await submissionActivity.save();
    return submissionActivity;
  };

  updateSubmissionActivity = async (pieces, subcase, submission = null) => {
    const submissionActivity = await this.store.queryOne('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'filter[:has-no:agenda-activity]': true,
      include: 'pieces',
    });

    if (submissionActivity) { // Adding pieces to existing submission activity
      const submissionPieces = await submissionActivity.pieces;
      addObjects(submissionPieces, pieces);
      submissionActivity.submission = submission;
      await submissionActivity.save();
      return submissionActivity;
    } else { // Create first submission activity to add pieces on
      return this.createSubmissionActivity(pieces, subcase, null, submission);
    }
  };

  updateRelatedAgendaitems = task(async (pieces, subcase) => {
    // Link piece to all agendaitems that are related to the subcase via an agendaActivity
    // and related to an agenda in the design status
    const agendaitems = await this.store.query('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': subcase.id,
      'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
    });

    // agendaitems can only have more than 1 item
    // in case the subcase is on multiple (future) open agendas
    for (const agendaitem of agendaitems.slice()) {
      setNotYetFormallyOk(agendaitem);
      // save prior to adding pieces, micro-service does all the changes with docs
      await agendaitem.save();
      for (const piece of pieces) {
        await addPieceToAgendaitem(agendaitem, piece);
      }
      // ensure the cache does not hold stale data + refresh our local store for future saves of agendaitem
      for (let index = 0; index < 10; index++) {
        const agendaitemPieces = await agendaitem.hasMany('pieces').reload();
        if (agendaitemPieces.includes(pieces[pieces.length - 1])) {
          // last added piece was found in the list from cache
          break;
        } else {
          // list from cache is stale, wait with back-off strategy
          await timeout(500 + (index * 500));
          if (index >= 9) {
            this.toaster.error(this.intl.t('documents-may-not-be-saved-message'), this.intl.t('warning-title'),
              {
                timeOut: 60000,
              });
          }
        }
      }
    }
  });
}
