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

  @tracked agendas;
  @tracked selectedAgenda;
  @tracked privateComment;
  @tracked isFormallyOk;

  constructor() {
    super(...arguments);
    this.loadAgendas.perform();
  }

  @task
  *loadAgendas() {
    const dateOfToday = subWeeks(new Date, 1).toISOString();
    const futureDate = addWeeks(new Date, 20).toISOString();

    this.agendas = yield this.store.query('agenda', {
      filter: {
        'status': {
          ':uri:': CONSTANTS.AGENDA_STATUSSES.DESIGN
        },
        'created-for': {
          ':gte:planned-start': dateOfToday,
          ':lte:planned-start': futureDate,
          ':has-no:agenda': true
        }
      },
      include: 'status,created-for,created-for.kind',
      sort:'created-for.planned-start'
    })
  }

  @task
  *saveSubcaseAndSubmitToAgenda() {
    const meeting = yield this.selectedAgenda.createdFor;
    this.args.onConfirm(false, meeting, this.isFormallyOk, this.privateComment);
  }

@action
  saveSubcase() {
    this.args.onConfirm(false);
  }

  @action
  selectAgenda(agenda) {
    this.selectedAgenda = agenda;
  }

  @action
  isSelectedAgenda(agenda) {
    return this.selectedAgenda && this.selectedAgenda.id === agenda.id;
  }

}