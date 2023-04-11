import Controller from '@ember/controller';

export default class PublicationsOverviewShortlistController extends Controller {
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
}
