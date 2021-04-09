import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class NewPublicationModal extends Component {
  @service publicationService;

  @tracked number = null;
  @tracked suffix = null;
  @tracked shortTitle = null;
  @tracked longTitle = null;

  @tracked hasError = false;
  @tracked numberIsAlreadyUsed;

  constructor() {
    super(...arguments);
    this.initPublicationNumber.perform();
  }

  get isPublicationNumberValid() {
    return this.number && this.number > 0 && !this.numberIsAlreadyUsed;
  }

  get isShortTitleValid() {
    return this.shortTitle && this.shortTitle.length > 0;
  }

  get hasPublicationNumberError() {
    return this.hasError && !this.isPublicationNumberValid;
  }

  get hasShortTitleError() {
    return this.hasError && !this.isShortTitleValid;
  }

  @task
  *initPublicationNumber() {
    this.number = yield this.publicationService.getNewPublicationNextNumber();
  }

  @task
  *save() {
    this.hasError = !this.isPublicationNumberValid || !this.isShortTitleValid;

    if (!this.hasError) {
      yield this.args.onSave(
        {
          number: this.number,
          suffix: this.suffix,
          shortTitle: this.shortTitle,
          longTitle: this.longTitle,
        });
    }
  }

  @action
  async isPublicationNumberAlreadyTaken() {
    this.numberIsAlreadyUsed = await this.publicationService.publicationNumberAlreadyTaken(this.number, this.suffix);
  }
}
