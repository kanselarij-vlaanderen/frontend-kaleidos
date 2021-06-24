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
    const nota = await this.args.agendaitem.get('notaOrVisienota');
    if (nota) {
      const piece = await nota.get('lastPiece');
      window.open(`/document/${piece.get('id')}`);
    }
  }
}
