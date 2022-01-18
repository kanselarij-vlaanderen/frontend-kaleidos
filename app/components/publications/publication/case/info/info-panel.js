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

  @tracked publicationNumberErrorKey;
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;

  @tracked numacNumbers;
  numacNumbersToDelete;

  @tracked isPublicationOverdue;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  initFields() {
    this.setIsPublicationOverdue();
  }

  @action
  async putInEditMode() {
    let publicationFlow = this.args.publicationFlow;
    this.isInEditMode = true;

    this.isUrgent = await this.publicationService.getIsUrgent(publicationFlow);
    let identification = await publicationFlow.identification;
    let structuredIdentifier = await identification.structuredIdentifier;
    this.publicationNumber = structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = structuredIdentifier.versionIdentifier;

    this.numacNumbers = publicationFlow.numacNumbers.toArray();
    this.numacNumbersToDelete = [];
  }

  @action
  onChangeIsUrgent(ev) {
    let isUrgent = ev.target.checked;
    this.isUrgent = isUrgent;
  }

  @restartableTask
  *setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
    yield this.checkPublicationNumber.perform();
  }

  @restartableTask
  *setPublicationNumberSuffix(event) {
    this.publicationNumberSuffix = isBlank(event.target.value)
      ? undefined
      : event.target.value;
    yield this.checkPublicationNumber.perform();
  }

  @restartableTask
  *checkPublicationNumber() {
    this.publicationNumberErrorKey = undefined;
    if (isBlank(this.publicationNumber)) {
      this.publicationNumberErrorKey = 'publication-number-error-required';
    } else {
      let publicationNumber = Number.parseFloat(this.publicationNumber);
      let isNumeric =
        Number.isInteger(publicationNumber) && publicationNumber > 0;
      if (!isNumeric) {
        this.publicationNumberErrorKey = 'publication-number-error-numeric';
      } else {
        yield timeout(1000);
        let isAlreadyTaken =
          yield this.publicationService.publicationNumberAlreadyTaken(
            this.publicationNumber,
            this.publicationNumberSuffix
          );
        if (isAlreadyTaken) {
          this.publicationNumberErrorKey = 'publication-number-error-taken';
        }
      }
    }
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
    this.isPublicationOverdue = await this.checkIsPublicationOverdue(
      publicationFlow
    );
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
    return !this.publicationNumberErrorKey;
  }

  @task
  *save() {
    let publicationFlow = this.args.publicationFlow;
    yield this.performSave(publicationFlow);
    this.isInEditMode = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave(publicationFlow) {
    let saves = [];

    let isPublicationFlowDirty = false;

    // Dringend
    let wasUrgent = this.publicationService.getIsUrgent(publicationFlow);
    if (this.isUrgent !== wasUrgent) {
      let urgencyLevel = await this.publicationService.getUrgencyLevel(
        this.isUrgent
      );
      publicationFlow.urgencyLevel = urgencyLevel;
      isPublicationFlowDirty = true;
    }

    // Publicatienummer
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

    // Numac-nummers
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
