import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';

export default class ShortlistPublicationsTableRowComponent extends Component {
  @service store;

  @tracked agendaitem;
  @tracked meetingId;
  @tracked agendaId;
  @tracked formattedAgendaNumber = "";
  @tracked mandateePersonNames;
  @tracked decisionDate;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    const piece = await this.args.row;
    this.agendaitem = await this.store.queryOne('agendaitem', {
      'filter[pieces][:id:]': piece.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    
    const agenda = await this.agendaitem.agenda;
    this.agendaId = agenda.id;
    const meeting = await agenda.createdFor;
    this.meetingId = await meeting.id;

    const agendaitemNumber = this.agendaitem.number;
    this.formattedAgendaNumber = addLeadingZeros(agendaitemNumber, 4);
    await this.loadMandateeData.perform();
    await this.loadDecisionDate.perform();
  });

  loadMandateeData = task(async () => {
    const mandatees = await this.agendaitem.mandatees;
    const persons = await Promise.all(
      mandatees
        .slice()
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    this.mandateePersonNames = persons.map((person) => person.fullName);
  });

  loadDecisionDate = task(async () => {
    const agendaitem = await this.agendaitem;
    const treatment = await agendaitem.treatment;
    const decisionActivity = await treatment.decisionActivity;
    this.decisionDate = await decisionActivity.startDate;
  });
}
