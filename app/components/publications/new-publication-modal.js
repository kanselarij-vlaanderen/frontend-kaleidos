import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';

/**
 * @argument { Promise<{ shortTitle: string, longTitle: string, }> } initialTitlesPromise
 * @argument { boolean } isViaCouncilOfMinisters
 * @argument { () => void } onCancel
 * @argument { (publicationProperties: {
          number: number,
          suffix: undefined | string,
          shortTitle: string,
          longTitle: string,
        })) => Promise<void> } onSave
 */
export default class NewPublicationModal extends Component {
  @service publicationService;
  @service store;

  @tracked number = null;
  @tracked suffix = null;
  @tracked areTitlesEditable = true;
  @tracked shortTitle = null;
  @tracked longTitle = null;

  @tracked hasError = false;
  @tracked numberIsAlreadyUsed;

  constructor() {
    super(...arguments);

    this.initTitles.perform();
    this.initPublicationNumber.perform();
  }

  get isLoading() {
    return this.initTitles.isRunning || this.save.isRunning;
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
  *initTitles() {
    // TODO get titles from @case
    if (this.args.initialTitlesPromise) {
      this.areTitlesEditable = false;
      const initialTitles = yield this.args.initialTitlesPromise;
      this.shortTitle = initialTitles.shortTitle;
      this.longTitle = initialTitles.longTitle;
    }
  }

  @task
  *initPublicationNumber() {
    const latestPublication = yield this.store.queryOne('publication-flow', {
      sort: '-identification.structured-identifier.local-identifier',
      include: 'identification.structured-identifier',
    });
    if (latestPublication) {
      const identification =  yield latestPublication.identification;
      const structuredIdentifier = yield identification.structuredIdentifier;
      this.number = structuredIdentifier.localIdentifier + 1;
    } else {
      this.number = 1;
    }
  }

  @task
  *save() {
    this.hasError = !this.isPublicationNumberValid || !this.isShortTitleValid;

    if (!this.hasError) {
      yield this.args.onSave(
        {
          number: this.number,
          suffix: isBlank(this.suffix) ? undefined : this.suffix,
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
