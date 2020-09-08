import Component from '@glimmer/component';
import {
  action,
  computed
} from '@ember/object';

export default class ButtonToolbarNewsletterTable extends Component {
  @computed('this.args.agendaItem')
  get latestMeetingId() {
    return  this.args.agendaItem.get('agenda').then((agenda) => agenda.get('createdFor').then((meeting) => meeting.id));
  }

  @computed('this.args.agendaItem')
  get latestAgendaId() {
    return this.args.agendaItem.get('agenda').then((agenda) => agenda.id);
  }

  @computed('this.args.agendaItem')
  get latestAgendaItemId() {
    return this.args.agendaItem.get('id');
  }

  @action
  async openNota() {
    const nota = await this.args.agendaItem.get('nota');
    if (nota) {
      const documentVersion = await nota.get('lastDocumentVersion');
      window.open(`/document/${documentVersion.get('id')}`);
    }
  }
}
