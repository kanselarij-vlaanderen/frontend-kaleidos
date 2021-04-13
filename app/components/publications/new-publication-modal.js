import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class NewPublicationModal extends Component {
  @service publicationService;
  @service store;

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
    this.number = yield this.getNextPublicationNumber();
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

  @action
  async getNextPublicationNumber() {
    // Deze query possibly breaks if publication-flows without number exist
    const latestPublication = await this.store.queryOne('publication-flow', {
      sort: '-publication-number',
    });
    if (latestPublication) {
      return latestPublication.publicationNumber + 1;
    }
    // This should only be a "no-data" issue, in that case we have to default to number 1
    return 1;
  }
}
