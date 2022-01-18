import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout, task, restartableTask } from 'ember-concurrency';
import moment from 'moment';
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

  @tracked decisionDate;
  @tracked openingDate;
  @tracked publicationDueDate;
  @tracked isPublicationOverdue;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  async initFields() {
    let publicationFlow = this.args.publicationFlow;
    this.decisionDate = await this.getDecisionDate(publicationFlow);
    this.openingDate = publicationFlow.openingDate;
    this.publicationDueDate = await this.getPublicationDueDate(publicationFlow);
    this.setIsPublicationOverdue();
  }

  async getDecisionDate(publicationFlow) {
    let agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    return agendaItemTreatment.startDate;
  }

  async getPublicationDueDate(publicationFlow) {
    let publicationSubcase = await publicationFlow.publicationSubcase;
    return publicationSubcase.dueDate;
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

  @task
  *setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
    yield this.checkPublicationNumber.perform();
  }

  @task
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
      return;
    }

    let publicationNumber = Number.parseFloat(this.publicationNumber);
    let isNumeric =
      Number.isInteger(publicationNumber) && publicationNumber > 0;
    if (!isNumeric) {
      this.publicationNumberErrorKey = 'publication-number-error-numeric';
      return
    }

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
  setDecisionDate(selectedDates) {
    this.decisionDate = selectedDates[0];
  }

  @action
  setOpeningDate(selectedDates) {
    this.openingDate = selectedDates[0];
  }

  @action
  setPublicationDueDate(selectedDates) {
    this.publicationDueDate = selectedDates[0];
    this.setIsPublicationOverdue();
  }

  async setIsPublicationOverdue() {
    let publicationFlow = this.args.publicationFlow;
    let publicationStatus = await publicationFlow.status;
    let isFinal = publicationStatus.isFinal;
    if (isFinal) {
      this.isPublicationOverdue = false;
      return;
    }

    this.isPublicationOverdue = moment(this.publicationDueDate).isBefore(Date.now(), 'day');
  }

  @action
  async cancelEdit() {
    await this.initFields();

    this.showError = false;
    this.isInEditMode = false;
  }

  get isValid() {
    return !this.publicationNumberErrorKey;
  }

  @task
  *save() {
    let publicationFlow = this.args.publicationFlow;

    let checkTask = this.checkPublicationNumber.last;
    let isCheckPending = checkTask && !checkTask.isFinished;
    if (isCheckPending) {
      yield checkTask;
      if (this.publicationNumberErrorKey) {
        return;
      }
    }

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
    let oldDecisionDate = agendaItemTreatment.startDate;
    if (this.decisionDate !== oldDecisionDate) {
      agendaItemTreatment.startDate = this.decisionDate;
      let agendaItemTreatmentSave = agendaItemTreatment.save();
      saves.push(agendaItemTreatmentSave);
    }

    // Datum ontvangst
    let oldOpeningDate = publicationFlow.openingDate;
    if (this.openingDate !== oldOpeningDate) {
      isPublicationFlowDirty = true;
    }

    if (isPublicationFlowDirty) {
      let publicationFlowSave = publicationFlow.save();
      saves.push(publicationFlowSave);
    }

    // Limiet publicatie
    let publicationSubcase = await publicationFlow.publicationSubcase;
    let oldPublicationDueDate = publicationSubcase.dueDate;
    if (oldPublicationDueDate !== this.publicationDueDate) {
      let publicationSubcaseSave = publicationSubcase.save();
      saves.push(publicationSubcaseSave);
    }

    await Promise.all(saves);
  }
}
