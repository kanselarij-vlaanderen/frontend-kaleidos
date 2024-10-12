import Component from '@glimmer/component';
import { addWeeks, subWeeks } from 'date-fns';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument onConfirm
 * @argument onCancel
 */
export default class ProposableAgendasModal extends Component {
  @service store;
  @service currentSession;

  @tracked agendas;
  @tracked selectedAgenda;
  @tracked selectedFormallyOkUri;
  @tracked privateComment;
  @tracked internalReview;

  constructor() {
    super(...arguments);
    this.loadAgendas.perform();
    this.selectedAgenda = this.args.defaultAgenda;
    this.loadInternalReview.perform();
  }

  get disablePutOnAgenda() {
    if (this.selectedAgenda && this.agendas) {
      for (const agenda of this.agendas) {
        if (agenda.id === this.selectedAgenda.id && this.selectedFormallyOkUri) {
          return false;
        }
      }
    }
    return true;
  }

  @task
  *loadAgendas() {
    const dateOfToday = subWeeks(new Date(), 1).toISOString();
    const futureDate = addWeeks(new Date(), 20).toISOString();

    this.agendas = yield this.store.query('agenda', {
      filter: {
        status: {
          ':uri:': CONSTANTS.AGENDA_STATUSSES.DESIGN,
        },
        'created-for': {
          ':gte:planned-start': dateOfToday,
          ':lte:planned-start': futureDate,
          ':has-no:agenda': true,
        },
      },
      include: 'status,created-for,created-for.kind',
      sort: 'created-for.planned-start',
    });
  }

  @task
  *loadInternalReview() {
    if (this.currentSession.may('manage-agendaitems')) {
      const internalReviewOfSubcase = yield this.args.subcase?.internalReview;
      const internalReviewOfSubmission = yield this.args.submission?.internalReview;
      this.internalReview = internalReviewOfSubcase || internalReviewOfSubmission;
      this.privateComment = this.internalReview?.privateComment || CONSTANTS.PRIVATE_COMMENT_TEMPLATE;
    }
  }

  @task
  *saveSubcaseAndSubmitToAgenda() {
    yield this.updateInternalReview();
    const meeting = yield this.selectedAgenda.createdFor;
    // don't yield this, the confirm closes this model so the task is aborted midway
    this.args.onConfirm(
      false,
      meeting,
      this.selectedFormallyOkUri,
      this.privateComment
    );
  }

  @action
  async saveSubcase() {
    await this.updateInternalReview();
    this.args.onConfirm(false, null, null, this.privateComment);
  }

  @action
  selectAgenda(agenda) {
    this.selectedAgenda = agenda;
  }

  @action
  isSelectedAgenda(agenda) {
    return this.selectedAgenda && this.selectedAgenda.id === agenda.id;
  }

  updateInternalReview = async() => {
    if (this.internalReview?.id) {
      this.internalReview.privateComment = this.privateComment;
      await this.internalReview.hasMany('submissions').reload();
      await this.internalReview.save();
    }
  }

}
