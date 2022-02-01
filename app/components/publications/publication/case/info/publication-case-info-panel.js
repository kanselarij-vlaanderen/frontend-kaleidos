import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout, task, restartableTask } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service store;
  @service publicationService;

  @tracked isViaCouncilOfMinisters;
  @tracked isEditing;

  @tracked publicationNumberErrorKey;

  // use copy: reload() does not seem to work on hasMany relationships
  @tracked numacNumbersEditing;
  numacNumbersToDelete;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  async initFields() {
    // Publication number
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(
        this.args.publicationFlow
      );
    this.identification = await this.args.publicationFlow.identification;
    this.structuredIdentifier = await this.identification.structuredIdentifier;
    // Numac-nummers
    this.numacNumbers = await this.args.publicationFlow.numacNumbers;
    // Datum beslissing
    this.agendaItemTreatment = await this.args.publicationFlow.agendaItemTreatment;
    // Limiet publicatie
    this.publicationSubcase = await this.args.publicationFlow.publicationSubcase;
  }

  @action
  async openEditingPanel() {
    this.isEditing = true;
    // Numac-nummers
    this.numacNumbersEditing = this.numacNumbers.toArray();
    this.numacNumbersToDelete = [];
  }

  @action
  changeIsUrgent(ev) {
    const isUrgent = ev.target.checked;
    const urgencyLevel = this.store.peekAll('urgency-level').find((level) => level.isUrgent === isUrgent);
    this.args.publicationFlow.urgencyLevel = urgencyLevel;
  }

  @task
  *setPublicationNumber(event) {
    const publicationNumberStr = event.target.value;
    this.publicationNumberErrorKey = undefined;

    if (isBlank(publicationNumberStr)) {
      this.publicationNumberErrorKey = 'publication-number-error-required';
      return;
    }

    const publicationNumber = Number.parseFloat(publicationNumberStr);
    const isNumeric =
      Number.isInteger(publicationNumber) && publicationNumber > 0;
    if (!isNumeric) {
      this.publicationNumberErrorKey = 'publication-number-error-numeric';
      return;
    }

    this.structuredIdentifier.localIdentifier = publicationNumber;

    yield this.checkPublicationNumber.perform();
  }

  @task
  *setPublicationNumberSuffix(event) {
    this.publicationNumberErrorKey = undefined;
    const publicationNumberSuffix = isBlank(event.target.value)
      ? undefined
      : event.target.value;
    this.structuredIdentifier.versionIdentifier = publicationNumberSuffix;
    yield this.checkPublicationNumber.perform();
  }

  @restartableTask
  *checkPublicationNumber() {
    const publicationNumber = this.structuredIdentifier.localIdentifier;
    const publicationNumberSuffix = this.structuredIdentifier.versionIdentifier;
    yield timeout(1000);
    const isAlreadyTaken =
      yield this.publicationService.publicationNumberAlreadyTaken(
        publicationNumber,
        publicationNumberSuffix,
        this.args.publicationFlow.id
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
      publicationFlowForNumac: this.args.publicationFlow,
    });
    this.numacNumbersEditing.pushObject(numacNumber);
  }

  @action
  deleteNumacNumber(numacNumber) {
    this.numacNumbersEditing.removeObject(numacNumber);
    this.numacNumbersToDelete.push(numacNumber);
  }

  @action
  setDecisionDate(selectedDates) {
    this.agendaItemTreatment.startDate = selectedDates[0];
  }

  @action
  setOpeningDate(selectedDates) {
    this.args.publicationFlow.openingDate = selectedDates[0];
  }

  @action
  setPublicationDueDate(selectedDates) {
    this.publicationSubcase.dueDate = selectedDates[0];
  }

  @task
  *closeEditingPanel() {
    const reloads = [];

    const urgencyLevelReload = this.args.publicationFlow
      .belongsTo('urgencyLevel')
      .reload();
    reloads.push(urgencyLevelReload);

    yield Promise.all(reloads);

    this.agendaItemTreatment.rollbackAttributes();
    this.publicationSubcase.rollbackAttributes();
    this.args.publicationFlow.rollbackAttributes();

    this.isEditing = false;
  }

  get isValid() {
    return !this.publicationNumberErrorKey;
  }

  @task
  *save() {
    const isSuccess = yield this.performSave();
    if (isSuccess) {
      this.isEditing = false;
    }
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave() {
    const isValid = await this.finishValidation();
    if (!isValid) {
      return false;
    }

    const saves = [];

    // Publicatienummer
    const publicationNumber = this.structuredIdentifier.localIdentifier;
    const publicationNumberSuffix = this.structuredIdentifier.versionIdentifier;
    this.identification.idName = publicationNumberSuffix
      ? `${publicationNumber} ${publicationNumberSuffix}`
      : `${publicationNumber}`;
    saves.push(this.structuredIdentifier.save());
    saves.push(this.identification.save());

    // Numac-nummers
    for (const numacNumber of this.numacNumbersToDelete) {
      const destroy = numacNumber.destroyRecord();
      saves.push(destroy);
    }

    this.numacNumbers.replace(
      0,
      this.numacNumbers.length,
      this.numacNumbersEditing
    );
    saves.push(this.numacNumbers.save());

    // Datum beslissing
    saves.push(this.agendaItemTreatment.save());

    // Dringend + Datum ontvangst
    saves.push(this.args.publicationFlow.save());

    // Limiet publicatie
    saves.push(this.publicationSubcase.save());

    await Promise.all(saves);

    return true;
  }

  async finishValidation() {
    const checkTask = this.checkPublicationNumber.last;
    const isCheckPending = checkTask && !checkTask.isFinished;
    if (isCheckPending) {
      await checkTask;
    }
    return this.isValid;
  }
}
