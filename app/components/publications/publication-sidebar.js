import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { lastValue, task } from 'ember-concurrency';

export default class PublicationsPublicationSidebarComponent extends Component {
  /**
   * @argument isOpen
   * @argument onCollapse
   * @argument onOpen
   * @argument {(model, changedKeys: string[]|string) => void} didChange
   *  on create and delete no changedKeys are passed
   */
  @service store;

  @lastValue('loadTranslationSubcase') translationSubcase;

  constructor() {
    super(...arguments);
    this.loadTranslationSubcase.perform();
  }

  get publicationFlow() {
    return this.args.publicationFlow;
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
