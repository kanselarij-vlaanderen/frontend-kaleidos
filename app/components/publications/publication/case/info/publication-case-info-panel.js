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
  @tracked decisionActivity;
  @tracked modelsForAgendaitemRoute;

  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;

  @tracked threadId;
  numacNumbersToDelete;

  constructor() {
    super(...arguments);

    this.initFields.perform();
  }

  @task
  *initFields() {
    this.isViaCouncilOfMinisters =
      yield this.publicationService.getIsViaCouncilOfMinisters(
        this.args.publicationFlow
      );
    // Publication number
    this.identification = yield this.args.publicationFlow.identification;
    this.structuredIdentifier = yield this.identification.structuredIdentifier;
    // using local tracked values because validation of these fields is delayed.
    // identification and structured-identifier are only updated after validation succeeds
    this.publicationNumber = this.structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = this.structuredIdentifier.versionIdentifier;
    // Numac-nummers
    this.numacNumbers = yield this.args.publicationFlow.numacNumbers;
    // Thread ID
    this.threadId = (yield this.args.publicationFlow.threadId)?.idName;
    // Datum beslissing
    this.decisionActivity = yield this.args.publicationFlow
      .decisionActivity;
    // Limiet publicatie
    this.publicationSubcase = yield this.args.publicationFlow
      .publicationSubcase;
    if (this.isViaCouncilOfMinisters && this.decisionActivity) {
      // get the models meeting/agenda/agendaitem for clickable link
      this.modelsForAgendaitemRoute = yield this.publicationService.getModelsForAgendaitemFromDecisionActivity(this.decisionActivity);
    }
  }

  get publicationNumberErrorTranslationKey() {
    if (this.numberIsRequired) {
      return 'publication-number-required-and-numeric';
    } else if (this.numberIsAlreadyUsed) {
      return 'publication-number-already-taken';
    } else {
      return null;
    }
  }

  get publicationModes() {
    return this.store.peekAll('publication-mode')
      .slice()
      .sort((p1, p2) => p1.position - p2.position);
  }

  get isValid() {
    return !this.publicationNumberErrorTranslationKey;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
    this.publicationNumber = this.structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = this.structuredIdentifier.versionIdentifier;
    this.numacNumbersToDelete = [];
  }

  @action
  changeIsUrgent(checked) {
    const isUrgent = checked;
    const urgencyLevel = this.store
      .peekAll('urgency-level')
      .find((level) => level.isUrgent === isUrgent);
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
      yield this.setStructuredIdentifier.perform();
    }
  }

  @restartableTask
  *setPublicationNumberSuffix(event) {
    this.publicationNumberSuffix = isBlank(event.target.value)
      ? undefined
      : event.target.value;
    yield this.setStructuredIdentifier.perform();
  }

  @restartableTask
  *setStructuredIdentifier() {
    yield timeout(1000);
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
      this.structuredIdentifier.versionIdentifier =
        this.publicationNumberSuffix;
      this.identification.idName = this.publicationNumberSuffix
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
  setPublicationMode(publicationMode) {
    this.args.publicationFlow.mode = publicationMode;
  }

  async saveThreadId() {
    this.threadId = this.threadId?.trim()
    const existingThreadId = await this.args.publicationFlow.threadId;
    if (existingThreadId) {
      if (!this.threadId) {
        return existingThreadId.destroyRecord();
      } else if (existingThreadId.idName !== this.threadId) {
        existingThreadId.idName = this.threadId;
        return existingThreadId.save();
      }
    } else {
      if (this.threadId) {
        const threadIdIdentification = this.store.createRecord('identification', {
          idName: this.threadId,
          agency: CONSTANTS.SCHEMA_AGENCIES.NUMAC,
          publicationFlowForThreadId: this.args.publicationFlow,
        });
        return threadIdIdentification.save();
      }
    }
  }

  @task
  *closeEditingPanel() {
    // Remove locally created numac-numbers that are not yet persisted in the backend
    const newNumacNumbers = this.numacNumbers.filter((number) => number.isNew);
    newNumacNumbers.forEach((number) => number.deleteRecord());
    // Reset thread ID
    this.threadId = (yield this.args.publicationFlow.threadId)?.idName;

    const reloads = [
      this.args.publicationFlow.belongsTo('urgencyLevel').reload(),
      this.args.publicationFlow.hasMany('numacNumbers').reload(),
    ];
    yield Promise.all(reloads);

    this.identification.rollbackAttributes();
    this.structuredIdentifier.rollbackAttributes();
    this.decisionActivity.rollbackAttributes();
    this.publicationSubcase.rollbackAttributes();
    this.args.publicationFlow.rollbackAttributes();
    yield this.args.publicationFlow.belongsTo('mode').reload();

    this.isEditing = false;
  }

  @task
  *save() {
    yield this.setStructuredIdentifier.last;
    if (!this.isValid) {
      return;
    }
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

    for (const numacNumber of this.numacNumbers.slice()) {
      if (numacNumber.isNew) {
        saves.push(numacNumber.save());
      }
    }

    // Thread ID
    saves.push(this.saveThreadId());

    // Datum beslissing
    if (!this.isViaCouncilOfMinisters) {
      saves.push(this.decisionActivity.save());
    }

    // Dringend + Datum ontvangst
    saves.push(this.args.publicationFlow.save());

    // Limiet publicatie
    saves.push(this.publicationSubcase.save());

    await Promise.all(saves);
  }
}
