import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';

export default class AgendaPrintableAgendaListSectionItemGroupComponent extends Component {

  @use sortedMandateesFromFirst = resource(() => {
    const sortedMandatees = new TrackedArray([]);
    const calculateSortedMandatees = async () => {
      sortedMandatees.length = 0;
      const agendaitem = this.args.items.at(0);
      const mandatees = await agendaitem.mandatees;
      mandatees
        .slice()
        .sort((m1, m2) => m1.priority - m2.priority)
        .forEach((mandatee) => sortedMandatees.push(mandatee));
    };
    calculateSortedMandatees();
    return sortedMandatees;
  });
}
