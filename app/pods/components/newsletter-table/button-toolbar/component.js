import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ButtonToolbarNewsletterTable extends Component {
  @action
  async openNota() {
    const nota = await this.args.agendaItem.get('nota');
    if (nota) {
      const documentVersion = await nota.get('lastDocumentVersion');
      window.open(`/document/${documentVersion.get('id')}`);
    }
  }
}
