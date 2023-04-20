import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class SignaturesIndexController extends Controller {
  @service router;
  @service store;

  getAgendaitem = async (piece) => {
    const agendaitems = await piece.agendaitems;
    let agendaitem;
    for (let maybeAgendaitem of agendaitems) {
      const agenda = await maybeAgendaitem.agenda;
      const nextVersion = await agenda.nextVersion;
      if (!nextVersion) {
        agendaitem = maybeAgendaitem;
        break;
      }
    }
    return agendaitem;
  }

  getDecisionDate = async (piece) => {
    const agendaitems = await piece.agendaitems;
    const treatments = await Promise.all(
      agendaitems.map((agendaitem) => agendaitem.treatment)
    );
    const decisionActivities = await Promise.all(
      treatments.map((treatment) => treatment.decisionActivity)
    );
    const decisionDates =
          decisionActivities.map((activity) => activity.startDate);
    if (decisionDates.length) {
      return decisionDates[0];
    }
  }

  getMandateeNames = async (piece) => {
    const agendaitem = await this.getAgendaitem(piece);
    const mandatees = await agendaitem.mandatees;
    const persons = await Promise.all(
      mandatees.map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }
}
