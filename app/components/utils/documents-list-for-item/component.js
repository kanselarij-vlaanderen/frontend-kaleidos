import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DocumentListForItem extends Component {
  @tracked isClickable = this.args.isClickable;

  @tracked isShowingAll = false;

  @tracked item = this.args.item;

  @tracked moreThan20 = null

  get documents() {
    if (this.item.documents.length > 20) {
      this.moreThan20 = true;
    } else {
      this.moreThan20 = false;
    }
    if (this.isShowingAll) {
      return this.item.documents;
    }
    return this.item.documents.slice(0, 20);
  }

  @action
  toggleShowingAll() {
    this.isShowingAll = !this.isShowingAll;
  }
}
