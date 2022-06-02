import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AgendaAgendaHeaderAgendaActionPopupAgendaitemsComponenet extends Component {
  @service store;
  @service agendaService;

  async newsletterInfo(agendaitem) {
    const newsletterInfos = await this.store.query('newsletter-info', {
      'filter[agenda-item-treatment][agendaitem][:id:]': agendaitem.id,
    });
    return newsletterInfos.firstObject;
  }

  async checkAdded(agendaitem) {
    return this.agendaService.addedAgendaitems?.includes(agendaitem.id);
  }
}
