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
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;

  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;

  numacNumbersToDelete;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  async initFields() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(
        this.args.publicationFlow
      );
    // Publication number
    this.identification = await this.args.publicationFlow.identification;
    this.structuredIdentifier = await this.identification.structuredIdentifier;
    // using local tracked values because validation of these fields is delayed.
    // identification and structured-identifier are only updated after validation succeeds
    this.publicationNumber = this.structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = this.structuredIdentifier.versionIdentifier;
    // Numac-nummers
    this.numacNumbers = await this.args.publicationFlow.numacNumbers;
    // Datum beslissing
    this.agendaItemTreatment = await this.args.publicationFlow.agendaItemTreatment;
    // Limiet publicatie
    this.publicationSubcase = await this.args.publicationFlow.publicationSubcase;
  }

  get publicationNumberErrorTranslationKey() {
    if (this.numberIsRequired) {
      return "publication-number-required-and-numeric";
    } else if (this.numberIsAlreadyUsed) {
      return "publication-number-already-taken";
    } else {
      return null;
    }
  }

  get isValid() {
    return this.publicationNumberErrorTranslationKey;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
    this.publicationNumber = this.structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = this.structuredIdentifier.versionIdentifier;
    this.numacNumbersToDelete = [];
  }

  @action
  changeIsUrgent(ev) {
    const isUrgent = ev.target.checked;
    const urgencyLevel = this.store.peekAll('urgency-level').find((level) => level.isUrgent === isUrgent);
    this.args.publicationFlow.urgencyLevel = urgencyLevel;
  }

  @restartableTask
  *setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
    const number = parseInt(this.publicationNumber, 10);
    if (isBlank(this.publicationNumber) || Object.is(NaN, number)) {
      this.numberIsRequired = true;
    } else {
      this.numberIsRequired = false;
      yield timeout(1000);
      this.setStructuredIdentifier.perform();
    }
  }

  @restartableTask
  *setPublicationNumberSuffix(event) {
    this.publicationNumberSuffix = isBlank(event.target.value) ? undefined : event.target.value;
    yield timeout(1000);
    this.setStructuredIdentifier.perform();
  }

  @restartableTask
  *setStructuredIdentifier() {
    const isPublicationNumberTaken =
          yield this.publicationService.publicationNumberAlreadyTaken(
            this.publicationNumber,
            this.publicationNumberSuffix,
            this.args.publicationFlow.id
          );
    if (isPublicationNumberTaken) {
      this.numberIsAlreadyUsed = true;
    } else {
      this.structuredIdentifier.localIdentifier = this.publicationNumber;
      this.structuredIdentifier.versionIdentifier = this.publicationNumberSuffix;
      this.identification.idName =
        this.publicationNumberSuffix
        ? `${this.publicationNumber} ${this.publicationNumberSuffix}`
        : `${this.publicationNumber}`;
      this.numberIsAlreadyUsed = false;
    }
  }

  @action
  addNumacNumber(newNumacNumber) {
    const numacNumber = this.store.createRecord('identification', {
      idName: newNumacNumber,
      agency: CONSTANTS.SCHEMA_AGENCIES.NUMAC,
      publicationFlowForNumac: this.args.publicationFlow,
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
    // Remove locally created numac-numbers that are not yet persisted in the backend
    const newNumacNumbers = this.numacNumbers.filter((number) => number.isNew);
    newNumacNumbers.forEach((number) => number.deleteRecord());

    const reloads = [
      this.args.publicationFlow.belongsTo('urgencyLevel').reload(),
      this.args.publicationFlow.hasMany('numacNumbers').reload(),
    ];
    yield Promise.all(reloads);

    this.identification.rollbackAttributes();
    this.structuredIdentifier.rollbackAttributes();
    this.agendaItemTreatment.rollbackAttributes();
    this.publicationSubcase.rollbackAttributes();
    this.args.publicationFlow.rollbackAttributes();

    this.isEditing = false;
  }

  @task
  *save() {
    yield this.performSave();
    this.isEditing = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave() {
    const saves = [];

    // Publicatienummer
    saves.push(this.structuredIdentifier.save());
    saves.push(this.identification.save());

    // Numac-nummers
    for (const numacNumber of this.numacNumbersToDelete) {
      saves.push(numacNumber.destroyRecord());
    }

    for (const numacNumber of this.numacNumbers.toArray()) {
      if (numacNumber.isNew) {
        saves.push(numacNumber.save());
      }
    }

    // Datum beslissing
    saves.push(this.agendaItemTreatment.save());

    // Dringend + Datum ontvangst
    saves.push(this.args.publicationFlow.save());

    // Limiet publicatie
    saves.push(this.publicationSubcase.save());

    await Promise.all(saves);
  }
}
