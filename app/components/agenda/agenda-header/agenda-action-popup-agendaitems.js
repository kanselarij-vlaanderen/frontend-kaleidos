import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import bind from 'frontend-kaleidos/utils/bind';

export default class AgendaAgendaHeaderAgendaActionPopupAgendaitemsComponenet extends Component {
  @service agendaService;

  @bind
  async checkAdded(agendaitem) {
    return this.agendaService.addedAgendaitems?.includes(agendaitem.id);
  }
}
