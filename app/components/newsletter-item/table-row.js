import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class NewsletterItemTableRowComponent extends Component {
  @service currentSession;

  @tracked isOpenEditView = false;

  @task
  *saveNewsletterItem(newsletterItem) {
    yield this.args.onSave(newsletterItem);
    this.closeEditView();
  }

  @action
  async toggleInNewsletterFlag(event) {
    this.args.newsletterItem.inNewsletter = event.target.checked;
    await this.saveNewsletterItem.perform(this.args.newsletterItem);
  }

  @action
  async openNota() {
    const nota = await this.args.agendaitem.notaOrVisienota;
    if (nota) {
      const piece = await nota.get('lastPiece');
      window.open(`/document/${piece.get('id')}`);
    }
  }

  @action
  openEditView() {
    this.isOpenEditView = true;
  }

  @action
  closeEditView() {
    this.isOpenEditView = false;
  }
}
