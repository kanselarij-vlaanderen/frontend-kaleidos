import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  task,
  restartableTask,
  lastValue
} from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';
import moment from 'moment';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationSidebarComponent extends Component {
  /**
   * @argument isOpen
   * @argument onCollapse
   * @argument onOpen
   * @argument didChange: should take arguments (modifiedObject, keyName)
   */
  @service store;
  @service intl;
  @service toaster;
  @service publicationService;

  @tracked newNumacNumber = '';
  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;
  @tracked showConfirmWithdraw = false;
  @tracked publicationModes;
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;

  @lastValue('loadRegulationTypes') regulationTypes;
  @lastValue('loadPublicationStatus') publicationStatus;

  constructor() {
    super(...arguments);
    this.loadRegulationTypes.perform();
    this.loadPublicationStatus.perform();
    this.publicationModes = this.store.peekAll('publication-mode').sortBy('position');
    this.initializePublicationNumber.perform();
  }

  get publicationFlow() {
    return this.args.publicationFlow;
  }

  @task
  *loadRegulationTypes() {
    const regulationTypes = yield this.store.query('regulation-type', {
      sort: 'position',
    });
    return regulationTypes;
  }

  @task
  *loadPublicationStatus() {
    const publicationStatus = yield this.publicationFlow.status;
    return publicationStatus;
  }

  @task
  *initializePublicationNumber() {
    const identification = yield this.publicationFlow.identification;
    const structuredIdentifier = yield identification.structuredIdentifier;
    this.publicationNumber = structuredIdentifier.localIdentifier;
    this.publicationNumberSuffix = structuredIdentifier.versionIdentifier;
  }

  @action
  setRegulationType(regulationType) {
    this.publicationFlow.regulationType = regulationType;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'regulationType');
    }
  }

  @action
  setPublicationMode(publicationMode) {
    this.publicationFlow.mode = publicationMode;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'mode');
    }
  }

  @action
  setUrgencyLevel(urgencyLevel) {
    this.publicationFlow.urgencyLevel = urgencyLevel;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'urgencyLevel');
    }
  }

  @action
  setPublicationStatus(status) {
    if (status.isWithdrawn) {
      this.showConfirmWithdraw = true;
    } else {
      this.publicationFlow.status = status;
      this.loadPublicationStatus.perform();
      this.publicationFlow.closingDate = status.isPublished ? new Date() : null;
      if (this.args.didChange) {
        this.args.didChange(this.publicationFlow, ['status', 'closingDate']);
      }
    }
  }

  @action
  cancelWithdraw() {
    this.showConfirmWithdraw = false;
  }

  @action
  async withdrawPublicationFlow() {
    const publicationStatus = await this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.WITHDRAWN);
    this.publicationFlow.status = publicationStatus;
    this.publicationFlow.closingDate = new Date();
    this.loadPublicationStatus.perform();
    if (this.args.didChange) {
      await this.args.didChange(this.publicationFlow, ['status', 'closingDate']);
    }
    this.showConfirmWithdraw = false;
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
      if (this.args.didChange) {
        this.args.didChange(identification, 'idName');
        this.args.didChange(structuredIdentifier, 'localIdentifier');
        this.args.didChange(structuredIdentifier, 'versionIdentifier');
      }
    }
  }

  @action
  addNumacNumber() {
    const numacNumber = this.store.createRecord('identification', {
      idName: this.newNumacNumber,
      agency: CONSTANTS.NUMAC_SCHEMA_AGENCY,
      publicationFlowForNumac: this.publicationFlow,
    });

    if (this.args.didChange) {
      this.args.didChange(numacNumber);
    }
    this.newNumacNumber = '';
  }

  @action
  deleteNumacNumber(numacNumber) {
    numacNumber.deleteRecord();

    if (this.args.didChange) {
      this.args.didChange(numacNumber);
    }
  }

  get allowedUltimatePublicationDates() {
    const rangeStart = this.publicationFlow.translateBefore || new Date();
    return [
      {
        from: rangeStart,
        to: moment(rangeStart).add(1, 'year').toDate(), // eslint-disable-line newline-per-chained-call
      }
    ];
  }

  @action
  setUltimatePublicationDate(selectedDates) {
    const date = selectedDates[0];
    this.publicationFlow.publishBefore = date;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'publishBefore');
    }
  }

  @action
  setRequestedPublicationDate(selectedDates) {
    this.publicationFlow.publishDateRequested = selectedDates[0];
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'publishDateRequested');
    }
  }

  @action
  setPublicationDate(selectedDates) {
    this.publicationFlow.publishedAt = selectedDates[0];
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'publishedAt');
    }
  }

  get allowedUltimateTranslationDates() {
    return [
      {
        from: new Date(),
        to: this.publicationFlow.publishBefore || moment().add(1, 'year').toDate(), // eslint-disable-line newline-per-chained-call
      }
    ];
  }

  @action
  setUltimateTranslationDate(selectedDates) {
    const date = selectedDates[0];
    this.publicationFlow.translateBefore = date;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'translateBefore');
    }
  }

  @restartableTask
  *setRemark(event) {
    const newValue = event.target.value;
    this.publicationFlow.remark = newValue;
    yield timeout(1000);
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'remark');
    }
  }
}
