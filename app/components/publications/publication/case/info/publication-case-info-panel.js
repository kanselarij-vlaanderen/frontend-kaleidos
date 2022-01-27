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
  @service publicationService;

  @tracked isEditing;

  @tracked publicationNumberErrorKey;

  @tracked numacNumbers;
  numacNumbersToDelete;

  @tracked decisionDate;
  @tracked openingDate;
  @tracked publicationDueDate;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  async initFields() {
    const publicationFlow = this.args.publicationFlow;

    // Publication number
    this.identification = await publicationFlow.identification;
    this.structuredIdentifier = await this.identification.structuredIdentifier;
    // Numac-nummers
    this.numacNumbers = publicationFlow.numacNumbers.toArray();
    // Datum beslissing
    const agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    this.decisionDate = agendaItemTreatment.startDate;
    // Datum ontvangst
    this.openingDate = publicationFlow.openingDate;
    // Limiet publicatie
    const publicationSubcase = await publicationFlow.publicationSubcase;
    this.publicationDueDate = publicationSubcase.dueDate;
  }

  @action
  async openEditingPanel() {
    this.isEditing = true;
    this.numacNumbersToDelete = [];
  }

  @action
  async changeIsUrgent(ev) {
    const publicationFlow = this.args.publicationFlow;
    const isUrgent = ev.target.checked;
    const urgencyLevel = await this.getUrgencyLevel(isUrgent);
    publicationFlow.urgencyLevel = urgencyLevel;
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
    const isNumeric = Number.isInteger(publicationNumber) && publicationNumber > 0;
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
    const { publicationFlow } = this.args;
    const publicationNumber = this.structuredIdentifier.localIdentifier;
    const publicationNumberSuffix = this.structuredIdentifier.versionIdentifier;
    yield timeout(1000);
    const isAlreadyTaken =
      yield this.publicationService.publicationNumberAlreadyTaken(
        publicationNumber,
        publicationNumberSuffix,
        publicationFlow.id,
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
  }

  // TODO: review async getter once ember-resources can be used
  get isPublicationOverdue() {
    const publicationFlow = this.args.publicationFlow;
    const isFinal = publicationFlow.status.get('isFinal');
    if (isFinal) {
      return false;
    }
    const isPublicationOverdue = moment(this.publicationDueDate).isBefore(
      Date.now(),
      'day'
    );
    return isPublicationOverdue;
  }

  @task
  *closeEditingPanel() {
    const publicationFlow = this.args.publicationFlow;

    const urgencyLevelReload = publicationFlow.belongsTo('urgencyLevel').reload();
    const agendaItemTreatmentReload = publicationFlow.belongsTo('agendaItemTreatment').reload();
    const publicationSubcaseReload = publicationFlow.belongsTo('publicationSubcase').reload();

    yield Promise.all([urgencyLevelReload, agendaItemTreatmentReload, publicationSubcaseReload]);

    this.isEditing = false;
  }

  get isValid() {
    return !this.publicationNumberErrorKey;
  }

  @task
  *save() {
    const publicationFlow = this.args.publicationFlow;

    const checkTask = this.checkPublicationNumber.last;
    const isCheckPending = checkTask && !checkTask.isFinished;
    if (isCheckPending) {
      yield checkTask;
      if (this.publicationNumberErrorKey) {
        return;
      }
    }

    yield this.performSave(publicationFlow);
    this.isEditing = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave(publicationFlow) {
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

    const numacNumbers = await publicationFlow.numacNumbers;
    numacNumbers.replace(0, numacNumbers.length, this.numacNumbers);
    numacNumbers.save();

    // Datum beslissing
    const agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    agendaItemTreatment.startDate = this.decisionDate;
    const agendaItemTreatmentSave = agendaItemTreatment.save();
    saves.push(agendaItemTreatmentSave);

    // Datum ontvangst
    publicationFlow.openingDate = this.openingDate;

    saves.push(publicationFlow.save());

    // Limiet publicatie
    const publicationSubcase = await publicationFlow.publicationSubcase;
    publicationSubcase.dueDate = this.publicationDueDate;
    saves.push(publicationSubcase.save());

    await Promise.all(saves);
  }

  async getUrgencyLevel(isUrgent) {
    const urgencyLevels = this.store.peekAll('urgency-level');
    const urgencyLevelUri = isUrgent
      ? CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE
      : CONSTANTS.URGENCY_LEVELS.STANDARD;
    const urgencyLevel = urgencyLevels.find(
      (level) => level.uri === urgencyLevelUri
    );
    return urgencyLevel;
  }
}
