import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

/**
 * @argument onConfirm
 * @argument onCancel
 */
export default class CasesSubmissionsProposableAgendasModalComponent extends Component {
  @service agendaService;
  @service store;

  @tracked agendas;
  @tracked selectedAgenda;
  @tracked remarks;

  constructor() {
    super(...arguments);
    this.loadAgendas.perform();
  }

  @task
  *loadAgendas() {
    this.agendas = (yield this.agendaService.getOpenMeetings()).data.map(
      (meeting) => ({
        id: meeting.attributes.agendaId,
        uri: meeting.attributes.agenda,
        serialnumber: meeting.attributes.serialnumber,
        createdFor: {
          id: meeting.id,
          uri: meeting.attributes.uri,
          plannedStart: new Date(meeting.attributes.plannedStart),
          kind: {
            label: meeting.attributes.type,
          }
        },
      })
    );
  }

  @task
  *saveSubmissionAndSubmitToAgenda() {
    const meeting = yield this.selectedAgenda.createdFor;
    // don't yield onConfirm here or the task will be aborted on destruction of this component
    this.args.onConfirm(meeting, this.remarks);
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
