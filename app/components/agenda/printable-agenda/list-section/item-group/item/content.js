import Component from '@glimmer/component';

export default class AgendaPrintableAgendaListSectionItemGroupItemContentComponent extends Component {
  get agendaitemNumber() {
    // to fill gaps in numbering, we check if the mapping has a new number for @item
    const agendaitemMapping = this.args.newNumberMappings
      ?.filter((mapping) => mapping.agendaitem.id == this.args.item.id)
      .at(0);
    return agendaitemMapping?.newNumber || this.args.item.number;
  }
}
