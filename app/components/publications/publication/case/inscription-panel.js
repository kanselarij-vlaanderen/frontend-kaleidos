import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class PublicationsPublicationCaseInscriptionPanelComponent extends Component {
  @tracked isInEditMode;

  @tracked shortTitle;
  @tracked longTitle;

  @tracked showError;

  get isViaCouncilOfMinisters() {
    return !!this.args.latestSubcaseOnMeeting;
  }

  get isShortTitleValid() {
    return !isBlank(this.shortTitle);
  }

  get showShortTitleError() {
    return this.showError && !this.isShortTitleValid;
  }

  @action
  putInEditMode() {
    this.isInEditMode = true;
    this.shortTitle = this.args.publicationFlow.shortTitle;
    this.longTitle = this.args.publicationFlow.longTitle;
  }

  @action
  cancelEdit() {
    this.showError = false;
    this.isInEditMode = false;
  }

  @task
  *save() {
    this.showError = !this.isShortTitleValid;
    if (this.showError) {
      return;
    }

    this.args.publicationFlow.shortTitle = this.shortTitle;
    this.args.publicationFlow.longTitle = this.longTitle;
    // no try-catch: don't exit if save didn't work
    yield this.args.publicationFlow.save();
    this.showError = false;
    this.isInEditMode = false;
  }
}
