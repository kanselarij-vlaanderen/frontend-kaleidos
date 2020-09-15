import Component from '@glimmer/component';
import {
  action,
  computed
} from '@ember/object';

export default class ButtonToolbarNewsletterTable extends Component {
  @computed('this.args.agendaitem')
  get latestMeetingId() {
    return  this.args.agendaitem.get('agenda').then((agenda) => agenda.get('createdFor').then((meeting) => meeting.id));
  }

  @computed('this.args.agendaitem')
  get latestAgendaId() {
    return this.args.agendaitem.get('agenda').then((agenda) => agenda.id);
  }

  @computed('this.args.agendaitem')
  get latestAgendaitemId() {
    return this.args.agendaitem.get('id');
  }

  @action
  async openNota() {
    const nota = await this.args.agendaitem.get('nota');
    if (nota) {
      const documentVersion = await nota.get('lastDocumentVersion');
      window.open(`/document/${documentVersion.get('id')}`);
    }
  }
}
