import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  lastValue, restartableTask, task
} from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';
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
  @service intl;
  @service toaster;
  @service publicationService;

  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;
  @tracked publicationModes;
  @tracked regulationTypes;
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;
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
    this.loadStructuredIdentifier.perform();
    this.loadDecision.perform();
    this.publicationModes = this.store.peekAll('publication-mode').sortBy('position');
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

  @task
  *loadStructuredIdentifier() {
    const identification = yield this.publicationFlow.identification;
    const structuredIdentifier = yield identification.structuredIdentifier;
    this.publicationNumber = structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = structuredIdentifier.versionIdentifier;
  }

  @action
  setRegulationType(regulationType) {
    this.publicationFlow.regulationType = regulationType;
    this.notifyChanges(this.publicationFlow, 'regulationType');
  }

  @action
  setPublicationMode(publicationMode) {
    this.publicationFlow.mode = publicationMode;
    this.notifyChanges(this.publicationFlow, 'mode');
  }

  @action
  setUrgencyLevel(urgencyLevel) {
    this.publicationFlow.urgencyLevel = urgencyLevel;
    this.notifyChanges(this.publicationFlow, 'urgencyLevel');
  }

  @restartableTask
  *setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
    yield timeout(1000);
    this.numberIsRequired = false;
    this.numberIsAlreadyUsed = false;
    if (isBlank(this.publicationNumber)) {
      this.numberIsRequired = true;
      this.toaster.error(this.intl.t('publication-number-required'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
    } else {
      this.setStructuredIdentifier();
    }
  }

  @restartableTask
  *setPublicationNumberSuffix(event) {
    this.publicationNumberSuffix = isBlank(event.target.value) ? undefined : event.target.value;
    yield timeout(1000);
    this.numberIsRequired = false;
    this.numberIsAlreadyUsed = false;
    this.setStructuredIdentifier();
  }

  async setStructuredIdentifier() {
    const isPublicationNumberTaken = await this.publicationService.publicationNumberAlreadyTaken(this.publicationNumber, this.publicationNumberSuffix, this.publicationFlow.id);
    if (isPublicationNumberTaken) {
      this.numberIsAlreadyUsed = true;
      this.toaster.error(this.intl.t('publication-number-already-taken-with-params', {
        number: this.publicationNumber,
        suffix: isBlank(this.publicationNumberSuffix) ? this.intl.t('without-suffix') : `${this.intl.t('with-suffix')} '${this.publicationNumberSuffix}'`,
      }), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
    } else {
      const identification = await this.publicationFlow.identification;
      const structuredIdentifier = await identification.structuredIdentifier;
      const number = parseInt(this.publicationNumber, 10);
      structuredIdentifier.localIdentifier = number;
      structuredIdentifier.versionIdentifier = this.publicationNumberSuffix;
      identification.idName = this.publicationNumberSuffix ? `${number} ${this.publicationNumberSuffix}` : `${number}`;
      this.numberIsAlreadyUsed = false;
      this.notifyChanges(identification, ['idName']);
      this.notifyChanges(structuredIdentifier, ['localIdentifier', 'versionIdentifier']);
    }
  }

  @action
  addNumacNumber(newNumacNumber) {
    const numacNumber = this.store.createRecord('identification', {
      idName: newNumacNumber,
      agency: CONSTANTS.SCHEMA_AGENCIES.NUMAC,
      publicationFlowForNumac: this.publicationFlow,
    });
    this.notifyChanges(numacNumber);
  }

  @action
  deleteNumacNumber(numacNumber) {
    numacNumber.deleteRecord();
    this.notifyChanges(numacNumber);
  }

  @action
  setPublicationTargetEndDate(selectedDates) {
    this.publicationSubcase.targetEndDate = selectedDates[0];
    this.notifyChanges(this.publicationSubcase, 'targetEndDate');
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
