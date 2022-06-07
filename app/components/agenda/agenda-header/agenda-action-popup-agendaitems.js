import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import bind from 'frontend-kaleidos/utils/bind';

export default class AgendaAgendaHeaderAgendaActionPopupAgendaitemsComponenet extends Component {
  @service store;
  @service agendaService;

  @bind
  async newsletterInfo(agendaitem) {
    return await this.store.queryOne('newsletter-info', {
      'filter[agenda-item-treatment][agendaitem][:id:]': agendaitem.id,
    });
  }

  @bind
  async checkAdded(agendaitem) {
    return this.agendaService.addedAgendaitems?.includes(agendaitem.id);
  }
}
