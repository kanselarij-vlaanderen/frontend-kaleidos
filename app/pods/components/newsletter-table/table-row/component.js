import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class TableRowNewsletterTable extends Component {
  @tracked isEditing = false;

  @action
  startEditing() {
    this.isEditing = true;
  }

  @action
  stopEditing() {
    this.isEditing = false;
  }

  @action
  setInNewsletter(value) {
    this.args.newsletterInfo.inNewsletter = value;
    this.args.newsletterInfo.save();
  }
}
