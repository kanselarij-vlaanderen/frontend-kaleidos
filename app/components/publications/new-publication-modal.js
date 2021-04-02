import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class NewPublicationModal extends Component {
  @tracked numberIsAlreadyUsed;

  @tracked number = null;
  @tracked suffix = null;
  @tracked shortTitle = null;
  @tracked longTitle = null;

  @tracked hasError = false;

  constructor() {
    super(...arguments);
    this.initPublicationNumber();
  }

  async initPublicationNumber() {
    this.number = await this.args.getPublicationNumber();
  }

  @action
  save() {
    if (this.numberIsAlreadyUsed || !this.isPublicationNumberValid()  || !this.isShortTitleValid()) {
      this.hasError = true;
    } else {
      this.hasError = false;
    }

    if (!this.hasError) {
      this.args.onSave(this.toObject());
    }
  }

  @action
  cancel() {
    this.args.onCancel();
  }

  @action
  async validatePublicationNumber() {
    this.numberIsAlreadyUsed = await this.args.isPublicationNumberAlreadyTaken(this.toObject());
  }

  get getClassForGroupNumber() {
    if (this.numberIsAlreadyUsed || (this.hasError && !this.isPublicationNumberValid())) {
      return 'auk-form-group--error';
    }
    return null;
  }

  get getClassForGroupShortTitle() {
    if (this.hasError && !this.isShortTitleValid()) {
      return 'auk-form-group--error';
    }
    return null;
  }

  isPublicationNumberValid() {
    return this.number && this.number > 0;
  }

  isShortTitleValid() {
    return this.shortTitle && this.shortTitle.length > 0;
  }

  toObject() {
    return {
      number: this.number,
      suffix: this.suffix,
      shortTitle: this.shortTitle,
      longTitle: this.longTitle,
    };
  }
}
