import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  lastValue, restartableTask, task
} from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationSidebarComponent extends Component {
  /**
   * @argument isOpen
   * @argument onCollapse
   * @argument onOpen
   * @argument {(model, changedKeys: string[]|string) => void} didChange
   *  on create and delete no changedKeys are passed
   */
  @service store;
  @service publicationService;

  @tracked regulationTypes;
  @tracked decision;

  @lastValue('loadPublicationStatus') publicationStatus;
  @lastValue('loadPublicationSubcase') publicationSubcase;
  @lastValue('loadTranslationSubcase') translationSubcase;
  @lastValue('loadAgendaitemTreatment') treatment;

  constructor() {
    super(...arguments);
    this.loadPublicationStatus.perform();
    this.loadPublicationSubcase.perform();
    this.loadTranslationSubcase.perform();
    this.loadAgendaitemTreatment.perform();
    this.loadDecision.perform();
    this.regulationTypes =  this.store.peekAll('regulation-type').sortBy('position');
  }

  get publicationFlow() {
    return this.args.publicationFlow;
  }

  @task
  *loadPublicationStatus() {
    return yield this.publicationFlow.status;
  }

  @task
  *loadPublicationSubcase() {
    return yield this.publicationFlow.publicationSubcase;
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

  @task
  *loadAgendaitemTreatment() {
    return yield this.publicationFlow.agendaItemTreatment;
  }

  @action
  setRegulationType(regulationType) {
    this.publicationFlow.regulationType = regulationType;
    this.notifyChanges(this.publicationFlow, 'regulationType');
  }

  @action
  setTranslationDate(selectedDates) {
    this.translationSubcase.endDate = selectedDates[0];
    this.notifyChanges(this.translationSubcase, 'endDate');
  }

  @action
  setOpeningDate(selectedDates) {
    this.publicationFlow.openingDate = selectedDates[0];
    this.notifyChanges(this.publicationFlow, 'openingDate');
  }

  @action
  setDecisionDate(selectedDates) {
    this.treatment.startDate = selectedDates[0];
    this.notifyChanges(this.treatment, 'startDate');
  }

  @action
  setPublicationDate(selectedDates) {
    this.decision.publicationDate = selectedDates[0];
    this.notifyChanges(this.decision, 'publicationDate');
  }

  @restartableTask
  *setRemark(event) {
    const newValue = event.target.value;
    this.publicationFlow.remark = newValue;
    yield timeout(1000);
    this.notifyChanges(this.publicationFlow, 'remark');
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
