import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * @argument agendaitem
 * @argument newsletterInfo
 * @argument {number} itemIndex
 * @argument {boolean} allowEditing
 * @argument {boolean} showIndex
 */
export default class NewsletterNewsletterItemComponent extends Component {
  @tracked isEditing = false;
  @tracked itemIndex = 0;
  @tracked showIndex = false;
  agendaitem = null;
  newsletterInfo = null;

  allowEditing = true;

  @action
  stopEditing() {
    this.isEditing = false;
  }
  @action
  startEditing() {
    this.isEditing = true;
  }

  @action
  async saveChanges() {
    if (this.args.onSave) {
      await this.args.onSaveNewsletterEdit();
    }
    this.stopEditing();
  }
}
