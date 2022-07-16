import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class NewsletterItemPrintComponent extends Component {
  @service currentSession;

  @tracked isEditing = false;

  get canEditNewsletter(){
    return this.currentSession.may('manage-newsletter-infos');
  }

  @action
  openEdit() {
    this.isEditing = true;
  }

  @action
  closeEdit() {
    this.isEditing = false;
  }

  @action
  async save() {
    await this.args.onSave();
    this.closeEdit();
  }
}
