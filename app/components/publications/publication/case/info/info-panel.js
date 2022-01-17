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

  @tracked error;
  @tracked numberIsAlreadyUsed;
  @tracked numberIsRequired;
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;

  @tracked numacNumbers;
  numacNumbersToDelete;

  @tracked isPublicationOverdue;

  constructor() {
    super(...arguments);

    this.initFields()
  }

  initFields() {
    this.setIsPublicationOverdue();
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
    this.numacNumbersToDelete = [];
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

  @action
  addNumacNumber(newNumacNumber) {
    const numacNumber = this.store.createRecord('identification', {
      idName: newNumacNumber,
      agency: CONSTANTS.SCHEMA_AGENCIES.NUMAC,
      publicationFlowForNumac: this.publicationFlow,
    });
    this.numacNumbers.pushObject(numacNumber);
  }

  @action
  deleteNumacNumber(numacNumber) {
    this.numacNumbers.removeObject(numacNumber);
    this.numacNumbersToDelete.push(numacNumber);
  }

  @action
  async setDecisionDate(selectedDates) {
    let publicationFlow = this.args.publicationFlow;
    let agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    agendaItemTreatment.startDate = selectedDates[0];
  }

  @action
  setOpeningDate(selectedDates) {
    let publicationFlow = this.args.publicationFlow;
    publicationFlow.openingDate = selectedDates[0];
  }

  @action
  async setPublicationDueDate(selectedDates) {
    let publicationFlow = this.args.publicationFlow;
    let publicationSubcase = await publicationFlow.publicationSubcase;
    publicationSubcase.dueDate = selectedDates[0];
    this.setIsPublicationOverdue();
  }

  async setIsPublicationOverdue() {
    let publicationFlow = this.args.publicationFlow;
    this.isPublicationOverdue = await this.checkIsPublicationOverdue(publicationFlow);
  }

  async checkIsPublicationOverdue(publicationFlow) {
    let publicationStatus = await publicationFlow.status;
    let isFinal = publicationStatus.isFinal;
    if (isFinal) {
      return false;
    }

    let publicationSubcase = await publicationFlow.publicationSubcase;
    return publicationSubcase.isOverdue;
  }

  @action
  async cancelEdit() {
    let publicationFlow = this.args.publicationFlow;
    publicationFlow.rollbackAttributes();
    let agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    agendaItemTreatment.rollbackAttributes();
    let publicationSubcase = await publicationFlow.publicationSubcase;
    publicationSubcase.rollbackAttributes();

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

    var isPublicationFlowDirty = false;
    var wasUrgent = this.publicationService.getIsUrgent(publicationFlow);
    if (this.isUrgent !== wasUrgent) {
      var urgencyLevel = await this.publicationService.getUrgencyLevel(
        this.isUrgent
      );
      publicationFlow.urgencyLevel = urgencyLevel;
      isPublicationFlowDirty = true;
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

    for (let numacNumber of this.numacNumbersToDelete) {
      let destroy = numacNumber.destroyRecord();
      saves.push(destroy);
    }

    let numacNumbers = await publicationFlow.numacNumbers;
    numacNumbers.replace(0, numacNumbers.length, this.numacNumbers);
    numacNumbers.save();

    // Datum beslissing
    let agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    if (this.getHasDirtyAttributes(agendaItemTreatment)) {
      let agendaItemTreatmentSave = agendaItemTreatment.save();
      saves.push(agendaItemTreatmentSave);
    }

    // Datum ontvangst
    if (this.getHasDirtyAttributes(publicationFlow)) {
      isPublicationFlowDirty = true;
    }
    if (isPublicationFlowDirty) {
      let publicationFlowSave = publicationFlow.save();
      saves.push(publicationFlowSave);
    }

    // Limiet publicatie
    let publicationSubcase = await publicationFlow.publicationSubcase;
    if (this.getHasDirtyAttributes(publicationSubcase)) {
      let publicationSubcaseSave = publicationSubcase.save();
      saves.push(publicationSubcaseSave);
    }

    await Promise.all(saves);
  }

  /**
   * WORKAROUND:
   * When a property of a model is set to undefined, one would expect to be able to check by model.dirtyType === 'updated' or model.hasDirtyAttributes === true
   * However these properties can not be used because they have the same values as when no change did occur: dirtyType === undefined and hadDirtyAttributes === false
   * @param {*} model
   * @returns
   */
  getHasDirtyAttributes(model) {
    let changedAttributes = model.changedAttributes();
    // eslint-disable-next-line no-unused-vars
    for (let attribute of Object.keys(changedAttributes)) {
      return true;
    }
    return false;
  }
}
