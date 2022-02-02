import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { lastValue, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class PublicationsPublicationSidebarComponent extends Component {
  /**
   * @argument isOpen
   * @argument onCollapse
   * @argument onOpen
   * @argument {(model, changedKeys: string[]|string) => void} didChange
   *  on create and delete no changedKeys are passed
   */
  @service store;

  @tracked decision;

  @lastValue('loadTranslationSubcase') translationSubcase;

  constructor() {
    super(...arguments);
    this.loadTranslationSubcase.perform();
    this.loadDecision.perform();
  }

  get publicationFlow() {
    return this.args.publicationFlow;
  }

  @task
  *loadDecision() {
    const publicationSubcase = yield this.publicationFlow.publicationSubcase;
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
  }

  @task
  *loadTranslationSubcase() {
    const translationSubcase = yield this.publicationFlow.translationSubcase;
    return translationSubcase;
  }

  @action
  setTranslationDate(selectedDates) {
    this.translationSubcase.endDate = selectedDates[0];
    this.notifyChanges(this.translationSubcase, 'endDate');
  }

  @action
  setPublicationDate(selectedDates) {
    this.decision.publicationDate = selectedDates[0];
    this.notifyChanges(this.decision, 'publicationDate');
  }

  /**
   *
   * @param {Model} model
   * @param {string[] or string} changedKeys
   */
  notifyChanges(model, changedKeys) {
    if (this.args.didChange) {
      this.args.didChange(model, changedKeys);
    }
  }
}
