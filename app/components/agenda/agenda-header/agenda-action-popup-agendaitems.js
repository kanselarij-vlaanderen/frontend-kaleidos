import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import bind from 'frontend-kaleidos/utils/bind';

export default class AgendaAgendaHeaderAgendaActionPopupAgendaitemsComponenet extends Component {
  @service store;
  @service agendaService;

  @bind
  async newsletterInfo(agendaitem) {
    const newsletterInfos = await this.store.query('newsletter-info', {
      'filter[agenda-item-treatment][agendaitem][:id:]': agendaitem.id,
    });
    return newsletterInfos.firstObject;
  }

  @bind
  async checkAdded(agendaitem) {
    return this.agendaService.addedAgendaitems?.includes(agendaitem.id);
  }
}
