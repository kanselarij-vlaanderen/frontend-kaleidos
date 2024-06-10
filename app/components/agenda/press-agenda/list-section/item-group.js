import Component from '@glimmer/component';

export default class AgendaPrintableAgendaListSectionItemGroupComponent extends Component {

  get sortedMandateesFromFirst() {
    return this.args.items.firstObject.mandatees.sortBy('priority');
  }
}
