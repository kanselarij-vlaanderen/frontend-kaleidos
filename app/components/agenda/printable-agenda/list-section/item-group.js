import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { resource, use } from 'ember-resources';
import { task } from 'ember-concurrency';

export default class AgendaPrintableAgendaListSectionItemGroupComponent extends Component {

  getRatifications = task(async () => {
    return await Promise.all(this.args.items.map(async (item) => {
      const agendaActivity = await item.agendaActivity;
      const subcase = await agendaActivity?.subcase;
      const ratification = await subcase?.ratification;

      return ratification; 
    }));
  });

  ratifications = trackedTask(this, this.getRatifications);

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
