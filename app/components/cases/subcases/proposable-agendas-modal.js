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
  @tracked selectedFormallyOkUri;
  @tracked privateComment = `IF: 
BA: 
BZ: 
WT: 
Co-agendering: 

Def. check: `;

  constructor() {
    super(...arguments);
    this.loadAgendas.perform();
    this.selectedAgenda = this.args.defaultAgenda;
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
  *saveSubcaseAndSubmitToAgenda() {
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
