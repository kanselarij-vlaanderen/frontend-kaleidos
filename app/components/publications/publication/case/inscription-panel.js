import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsPublicationCaseInscriptionPanelComponent extends Component {
  @tracked isInEditMode;

  get isViaCouncilOfMinisters() {
    return !!this.args.latestSubcaseOnMeeting;
  }

  @action
  putInEditMode() {
    this.isInEditMode = true;
  }

  @action
  cancelEdit() {
    this.args.publicationFlow.rollbackAttributes();
    this.isInEditMode = false;
  }

  @task
  *save() {
    // no try-catch: don't exit if save didn't work
    yield this.args.publicationFlow.save();
    this.isInEditMode = false;
  }
}
