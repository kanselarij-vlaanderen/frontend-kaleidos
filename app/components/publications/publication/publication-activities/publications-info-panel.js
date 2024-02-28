import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument {publicationSubcase}
 * @argument {PublicationFlow}
 */
export default class PublicationsPublicationPublicationActivitiesPublicationInfoPanel extends Component {
  @service store;

  @tracked isEditing = false;
  @tracked decision;

  constructor() {
    super(...arguments);
    this.loadDecision.perform();
  }

  @task
  *loadDecision() {
    // Currently only 1 publication-activity and decision are assumed
    // per publication-subcase
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]':
        this.args.publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  async closeEditingPanel() {
    this.isEditing = false;
    this.args.publicationSubcase.rollbackAttributes();
  }

  @action
  setTargetEndDate(selectedDate) {
    // Business wants the target end date at 12 o'clock.
    this.args.publicationSubcase.targetEndDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      12,
      0
    );
  }

  @task
  *save() {
    yield this.args.publicationSubcase.save();
    if (this.decision?.hasDirtyAttributes) {
      yield this.decision.save();
    }
    this.isEditing = false;
  }
}
