import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.case)
 */
export default class PublicationsPublicationCaseInscriptionPanelComponent extends Component {
  @service publicationService;
  @tracked isEditing;
  @tracked isViaCouncilOfMinisters;

  @tracked shortTitle;
  @tracked longTitle;

  // ensure errors are only shown after first focus-out
  @tracked isEnabledErrorDisplay = false;

  constructor() {
    super(...arguments);
    this.initFields();
  }

  async initFields() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(
        this.args.publicationFlow
      );
  }

  get isShortTitleValid() {
    return !isBlank(this.shortTitle);
  }

  get showShortTitleError() {
    return this.isEnabledErrorDisplay && !this.isShortTitleValid;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
    this.shortTitle = this.args.publicationFlow.shortTitle;
    this.longTitle = this.args.publicationFlow.longTitle;
  }

  @action
  closeEditingPanel() {
    this.isEnabledErrorDisplay = false;
    this.isEditing = false;
  }

  @action
  enableErrorDisplay() {
    this.isEnabledErrorDisplay = true;
  }

  @task
  *save() {
    this.args.publicationFlow.shortTitle = this.shortTitle;
    this.args.publicationFlow.longTitle = this.longTitle;
    // no try-catch: don't exit edit-mode if save didn't work
    yield this.args.publicationFlow.save();
    this.isEditing = false;
  }
}
