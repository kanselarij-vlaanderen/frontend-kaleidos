import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';

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
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': this.args.publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
  }

  get publicationModes() {
    return this.store.peekAll('publication-mode').sortBy('position');
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  async closeEditingPanel() {
    this.isEditing = false;
    this.args.publicationSubcase.rollbackAttributes();
    await this.args.publicationFlow.belongsTo('mode').reload();
  }

  @action
  setTargetEndDate(selectedDates) {
    this.args.publicationSubcase.targetEndDate = selectedDates[0];
  }

  @action
  setPublicationDate(selectedDates) {
    this.decision.publicationDate = selectedDates[0];
  }

  @action
  setPublicationMode(publicationMode) {
    this.args.publicationFlow.mode = publicationMode;
  }

  @task
  *save() {
    yield all([
      this.args.publicationSubcase.save(),
      this.args.publicationFlow.save()
    ]);
    this.isEditing = false;
  }
}
