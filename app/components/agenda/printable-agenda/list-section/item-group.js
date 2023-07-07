import Component from '@glimmer/component';

export default class AgendaPrintableAgendaListSectionItemGroupComponent extends Component {

  get sortedMandateesFromFirst() {
    return this.args.items.at(0).mandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
  }
}
