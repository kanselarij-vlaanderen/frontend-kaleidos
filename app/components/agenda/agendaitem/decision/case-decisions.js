import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

/**
 * Lists all decisions (approved, postponed, retracted, acknowledged, ...)
 * within the same case (decisionmaking flow),
 * each linking to the decision tab of the agendaitem on which the decision
 * was made.
 *
 * @argument agendaitem
 */
export default class AgendaAgendaitemDecisionCaseDecisionsComponent extends Component {
  @service store;
  @service intl;

  @tracked decisions = [];

  @tracked hasDecisionmakingFlow = true;

  constructor() {
    super(...arguments);
    this.loadDecisions.perform();
  }

  loadDecisions = task({ restartable: true }, async () => {
    const agendaActivity = await this.args.agendaitem.agendaActivity;
    const subcase = await agendaActivity?.subcase;
    const decisionmakingFlow = await subcase?.decisionmakingFlow;
    this.hasDecisionmakingFlow = !!decisionmakingFlow;
    if (!decisionmakingFlow) {
      this.decisions = [];
      return;
    }

    const agendaitems = await this.store.queryAll('agendaitem', {
      'filter[agenda-activity][subcase][decisionmaking-flow][:id:]':
        decisionmakingFlow.id,
      'filter[:has-no:next-version]': 't',
      sort: '-agenda.created-for.planned-start,-number',
      include: [
        'agenda.created-for',
        'agenda.status',
        'previous-version',
        'treatment.decision-activity.decision-result-code',
      ].join(','),
    });

    const decisions = [];
    for (const agendaitem of agendaitems.slice()) {
      const agenda = await agendaitem.agenda;
      const agendaStatus = await agenda?.status;
      const previousVersion = await agendaitem.previousVersion;
      // an agendaitem that has only ever been on a design agenda has no decision yet.
      if (agendaStatus?.isDesignAgenda && !previousVersion) {
        continue;
      }
      const treatment = await agendaitem.treatment;
      const decisionActivity = await treatment?.decisionActivity;
      const decisionResultCode = await decisionActivity?.decisionResultCode;
      const meeting = await agenda.createdFor;
      decisions.push({
        resultLabel: decisionResultCode?.label,
        meetingId: meeting.id,
        agendaId: agenda.id,
        agendaitemId: agendaitem.id,
        linkText: `${this.intl.t('decision-in-case-agenda-of')} ${dateFormat(
          meeting.plannedStart,
          'dd MMMM yyyy'
        )}`,
      });
    }

    this.decisions = decisions;
  });
}
