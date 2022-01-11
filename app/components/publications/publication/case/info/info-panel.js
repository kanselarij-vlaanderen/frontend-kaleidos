import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task, restartableTask } from 'ember-concurrency-decorators';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service store;
  @service intl;
  @service publicationService;

  @tracked isInEditMode;

  @tracked isUrgent;

  @tracked numberIsAlreadyUsed;
  @tracked numberIsRequired;
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;

  @tracked numacNumbers;
  @tracked decisionDate;
  @tracked openingDate;
  @tracked publicationDueDate;

  constructor() {
    super(...arguments);
  }

  @action
  async putInEditMode() {
    var publicationFlow = this.args.publicationFlow;
    this.isInEditMode = true;

    this.isUrgent = await this.publicationService.getIsUrgent(publicationFlow);
    var identification = await publicationFlow.identification;
    var structuredIdentifier = await identification.structuredIdentifier;
    this.publicationNumber = structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = structuredIdentifier.versionIdentifier;

    this.numacNumbers = publicationFlow.numacNumbers.toArray();
  }

  @action
  onChangeIsUrgent(ev) {
    var isUrgent = ev.target.checked;
    this.isUrgent = isUrgent;
  }

  get isPublicationNumberValid() {
    return this.publicationNumber && this.publicationNumber > 0 && !this.numberIsAlreadyUsed;
  }

  @restartableTask
  *setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
    this.numberIsRequired = false;
    this.numberIsAlreadyUsed = false;
    if (isBlank(this.publicationNumber)) {
      this.numberIsRequired = true;
    } else {
      yield this.checkIsPublicationNumberAlreadyTaken.perform();
    }
  }

  @restartableTask
  *setPublicationNumberSuffix(event) {
    this.publicationNumberSuffix = isBlank(event.target.value)
      ? undefined
      : event.target.value;
    this.numberIsAlreadyUsed = false;
    yield this.checkIsPublicationNumberAlreadyTaken.perform();
  }

  @restartableTask
  *checkIsPublicationNumberAlreadyTaken() {
    yield timeout(1000);
    this.numberIsAlreadyUsed = yield this.publicationService.publicationNumberAlreadyTaken(this.publicationNumber, this.publicationNumberSuffix);
  }

  async setStructuredIdentifier() {
    var publicationFlow = this.args.publicationFlow;
    this.numberIsAlreadyUsed =
      await this.publicationService.publicationNumberAlreadyTaken(
        this.publicationNumber,
        this.publicationNumberSuffix,
        publicationFlow.id
      );
  }

  @action
  addNumacNumber(newNumacNumber) {
    const numacNumber = this.store.createRecord('identification', {
      idName: newNumacNumber,
      agency: CONSTANTS.SCHEMA_AGENCIES.NUMAC,
      publicationFlowForNumac: this.publicationFlow,
    });
    this.numacNumbers.push(numacNumber);
  }

  @action
  deleteNumacNumber(numacNumber) {
    numacNumber.deleteRecord();
    this.numacNumbers.removeObject(numacNumber);
  }

  @action
  cancelEdit() {
    this.showError = false;
    this.isInEditMode = false;
  }

  get isValid() {
    return this.isPublicationNumberValid;
  }

  @task
  *save() {
    var publicationFlow = this.args.publicationFlow;
    yield this.performSave(publicationFlow);
    this.isInEditMode = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave(publicationFlow) {
    var saves = [];

    var isDirty = false;
    var wasUrgent = this.publicationService.getIsUrgent(publicationFlow);
    if (this.isUrgent !== wasUrgent) {
      var urgencyLevel = await this.publicationService.getUrgencyLevel(
        this.isUrgent
      );
      publicationFlow.urgencyLevel = urgencyLevel;
      isDirty = true;
    }

    const identification = await publicationFlow.identification;
    const structuredIdentifier = await identification.structuredIdentifier;
    const number = parseInt(this.publicationNumber, 10);
    structuredIdentifier.localIdentifier = number;
    structuredIdentifier.versionIdentifier = this.publicationNumberSuffix;
    if (structuredIdentifier.dirtyType === 'updated') {
      identification.idName = this.publicationNumberSuffix
        ? `${number} ${this.publicationNumberSuffix}`
        : `${number}`;

      saves.push(structuredIdentifier.save());
      saves.push(identification.save());
    }

    var numacNumbers = await publicationFlow.numacNumbers;
    var numacNumbersArray = (await publicationFlow.numacNumbers).toArray();
    for (let numacNumber of numacNumbersArray) {
      if (numacNumber.dirtyType === 'deleted') {
        numacNumber.save();
      }
    }

    numacNumbers.replace(0, numacNumbers.length, this.numacNumbers);
    numacNumbers.save();

    if (isDirty) {
      saves.push(publicationFlow.save());
    }

    await Promise.all(saves);
  }
}
