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

  @tracked isViaCouncilOfMinisters;

  // copied properties
  // reason: prevent editing the publation-flow record directly,
  // in order to prevent commiting changes when saving the publication-flow record in another panel
  @tracked isUrgent;

  @tracked publicationNumberErrorKey;
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;

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
    this.isViaCouncilOfMinisters = await this.getIsViaCouncilOfMinisters(
      publicationFlow
    );

    this.isUrgent = await this.publicationService.getIsUrgent(publicationFlow);
    this.numacNumbers = publicationFlow.numacNumbers.toArray();
    const agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    this.decisionDate = agendaItemTreatment.startDate;
    this.openingDate = publicationFlow.openingDate;
    const publicationSubcase = await publicationFlow.publicationSubcase;
    this.publicationDueDate = publicationSubcase.dueDate;
  }

  async getIsViaCouncilOfMinisters(publicationFlow) {
    const _case = await publicationFlow.case;
    const subcases = await _case.subcases;
    return !!subcases.length;
  }

  @action
  async putInEditMode() {
    const publicationFlow = this.args.publicationFlow;
    this.isInEditMode = true;

    const identification = await publicationFlow.identification;
    const structuredIdentifier = await identification.structuredIdentifier;
    this.publicationNumber = structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = structuredIdentifier.versionIdentifier;

    this.numacNumbersToDelete = [];
  }

  @action
  onChangeIsUrgent(ev) {
    const isUrgent = ev.target.checked;
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

    const publicationNumber = Number.parseFloat(this.publicationNumber);
    const isNumeric =
      Number.isInteger(publicationNumber) && publicationNumber > 0;
    if (!isNumeric) {
      this.publicationNumberErrorKey = 'publication-number-error-numeric';
      return;
    }

    yield timeout(1000);
    const isAlreadyTaken =
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

  @action
  async cancelEdit() {
    await this.initFields();

    this.isInEditMode = false;
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
    this.isInEditMode = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave(publicationFlow) {
    const saves = [];

    let isPublicationFlowDirty = false;

    // Dringend
    const wasUrgent = this.publicationService.getIsUrgent(publicationFlow);
    if (this.isUrgent !== wasUrgent) {
      const urgencyLevel = await this.publicationService.getUrgencyLevel(
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
    for (const numacNumber of this.numacNumbersToDelete) {
      const destroy = numacNumber.destroyRecord();
      saves.push(destroy);
    }

    const numacNumbers = await publicationFlow.numacNumbers;
    numacNumbers.replace(0, numacNumbers.length, this.numacNumbers);
    for (const numacNumber of this.numacNumbers) {
      if (numacNumber.dirtyType === 'created') {
        saves.push(numacNumber.save());
      }
    }

    // Datum beslissing
    const agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    const oldDecisionDate = agendaItemTreatment.startDate;
    if (this.decisionDate !== oldDecisionDate) {
      agendaItemTreatment.startDate = this.decisionDate;
      const agendaItemTreatmentSave = agendaItemTreatment.save();
      saves.push(agendaItemTreatmentSave);
    }

    // Datum ontvangst
    const oldOpeningDate = publicationFlow.openingDate;
    if (this.openingDate !== oldOpeningDate) {
      publicationFlow.openingDate = this.openingDate;
      isPublicationFlowDirty = true;
    }

    if (isPublicationFlowDirty) {
      const publicationFlowSave = publicationFlow.save();
      saves.push(publicationFlowSave);
    }

    // Limiet publicatie
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const oldPublicationDueDate = publicationSubcase.dueDate;
    if (oldPublicationDueDate !== this.publicationDueDate) {
      publicationSubcase.dueDate = this.publicationDueDate;
      const publicationSubcaseSave = publicationSubcase.save();
      saves.push(publicationSubcaseSave);
    }

    await Promise.all(saves);
  }
}
