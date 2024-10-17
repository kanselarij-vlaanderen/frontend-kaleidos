import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaPressRoute extends Route {
  @service store;

  async model() {
    const { meeting, agenda } = this.modelFor('agenda');
    const agendaitems = await this.store.query('agendaitem', {
      filter: {
        agenda: {
          id: agenda.id,
        },
        type: {
          ':uri:': CONSTANTS.AGENDA_ITEM_TYPES.NOTA,
        },
        treatment: {
          'decision-activity': {
            'decision-result-code': {
              ':uri:': CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD,
            },
            subcase: {
              confidential: false,
            }
          },
        },
        ':or:': {
          'is-approval': false,
          ':has-no:is-approval': true,
        },
        ':has:created': `date-added-for-cache-busting-${new Date().toISOString()}`,
      },
      include: 'mandatees,agenda-activity.subcase.type',
    });
    return {
      meeting,
      agendaitems: await this.sortAgendaitems(agendaitems),
    };
  }

  async sortAgendaitems(agendaitems) {
    for (const agendaitem of agendaitems) {
      const mandatees = await agendaitem.mandatees;
      const sortedMandatees = mandatees
        .slice()
        .sort((m1, m2) => m1.priority - m2.priority);

      // Store the mandatee priorities as an array so we can sort the agendaitems
      const priorityArray = sortedMandatees.length
        ? sortedMandatees.map((m) => m.priority)
        : [99];
      agendaitem.__mandateePriority = priorityArray.map((p) => p.toString());
    }

    const sorted = agendaitems.slice().sort((a1, a2) => {
      let priority1 = a1.__mandateePriority;
      let priority2 = a2.__mandateePriority;
      let numberLength = 0;

      // Pad the strings with 0s so the sort works
      [...priority1, ...priority2].forEach(
        (p) => (numberLength = Math.max(numberLength, p.length))
      );

      priority1 = priority1
        .map((p) => p.padStart(numberLength, '0'))
        .sort()
        .toString();
      priority2 = priority2
        .map((p) => p.padStart(numberLength, '0'))
        .sort()
        .toString();
      return priority1 === priority2
        ? a1.number - a2.number
        : priority1 < priority2
          ? -1
          : 1;
    });

    for (const agendaitem of agendaitems) {
      delete agendaitem.__mandateePriority;
    }

    return sorted;
  }
}
