import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  lastValue, restartableTask, task
} from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
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

  // Tracked props.
  @tracked newNumacNumber = '';
  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;
  @tracked showConfirmWithdraw = false;

  @lastValue('loadRegulationTypes') regulationTypes;
  @lastValue('loadPublicationStatus') publicationStatus;
  @tracked publicationModes;

  constructor() {
    super(...arguments);
    this.loadRegulationTypes.perform();
    this.loadPublicationStatus.perform();
    this.publicationModes = this.store.peekAll('publication-mode').sortBy('position');
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
  async setPublicationStatus(status) {
    if (status.isWithdrawn) {
      this.showConfirmWithdraw = true;
    } else {
      this.publicationFlow.status = status;
      this.loadPublicationStatus.perform();
      this.publicationFlow.closingDate = status.isPublished ? new Date() : null;

      await this.setPublicationStatusChange();

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
    this.publicationFlow.status = await this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.WITHDRAWN);
    this.publicationFlow.closingDate = new Date();

    await this.setPublicationStatusChange();

    this.loadPublicationStatus.perform();
    if (this.args.didChange) {
      await this.args.didChange(this.publicationFlow, ['status', 'closingDate']);
    }
    this.showConfirmWithdraw = false;
  }

  @restartableTask
  *setPublicationNumber(event) {
    yield timeout(1000);
    this.numberIsRequired = false;
    this.numberIsAlreadyUsed = false;
    if (event.target.value === '') {
      this.numberIsRequired = true;
      this.toaster.error(this.intl.t('publication-number-required'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      return;
    }
    const publicationSuffix = this.publicationFlow.publicationSuffix;
    this.publicationService.publicationNumberAlreadyTaken(event.target.value, publicationSuffix, this.publicationFlow.id).then((isPublicationNumberTaken) => {
      if (isPublicationNumberTaken) {
        this.numberIsAlreadyUsed = true;
        let suffixText = this.intl.t('without-suffix');
        if (publicationSuffix && publicationSuffix !== '') {
          suffixText = `${this.intl.t('with-suffix')} '${publicationSuffix}'`;
        }
        this.toaster.error(this.intl.t('publication-number-already-taken-with-params', {
          number: event.target.value,
          suffix: suffixText,
        }), this.intl.t('warning-title'), {
          timeOut: 20000,
        });
        // rollback the value in the view
        event.target.value = this.publicationFlow.publicationNumber || '';
      } else {
        const number = parseInt(event.target.value, 10);
        this.publicationFlow.publicationNumber = number;
        this.numberIsAlreadyUsed = false;
        if (this.args.didChange) {
          this.args.didChange(this.publicationFlow, 'publicationNumber');
        }
      }
    });
  }

  @restartableTask
  *setPublicationSuffix(event) {
    yield timeout(1000);
    this.numberIsAlreadyUsed = false;
    const publicationNumber = this.publicationFlow.publicationNumber;
    this.publicationService.publicationNumberAlreadyTaken(publicationNumber, event.target.value, this.publicationFlow.id).then((isPublicationNumberTaken) => {
      if (isPublicationNumberTaken) {
        this.numberIsAlreadyUsed = true;
        let suffixText = this.intl.t('without-suffix');
        if (event.target.value !== '') {
          suffixText = `${this.intl.t('with-suffix')} '${event.target.value}'`;
        }
        this.toaster.error(this.intl.t('publication-number-already-taken-with-params', {
          number: publicationNumber,
          suffix: suffixText,
        }), this.intl.t('warning-title'), {
          timeOut: 20000,
        });
        // rollback the value in the view
        event.target.value = this.publicationFlow.publicationSuffix || '';
      } else {
        // TODO trimText here to remove spaces, enters ?
        if (event.target.value !== '') {
          this.publicationFlow.publicationSuffix = event.target.value;
        } else {
          this.publicationFlow.publicationSuffix = undefined;
        }
        this.numberIsAlreadyUsed = false;
        if (this.args.didChange) {
          this.args.didChange(this.publicationFlow, 'publicationSuffix');
        }
      }
    });
  }

  @task
  *addNumacNumber() {
    const numacNumber = yield this.store.createRecord('numac-number', {
      name: this.newNumacNumber,
      publicationFlow: this.publicationFlow,
    });
    if (this.args.didChange) {
      this.args.didChange(numacNumber);
    }
    this.newNumacNumber = '';
  }

  @task
  *unlinkNumacNumber(numacNumber) {
    numacNumber.deleteRecord();
    if (this.args.didChange) {
      yield this.args.didChange(numacNumber);
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

  async setPublicationStatusChange() {
    const publicationStatusChange = this.store.createRecord('publication-status-change', {
      startedAt: new Date(),
      publication: this.publicationFlow,
    });

    this.publicationFlow.publicationStatusChange = publicationStatusChange;
    if (this.args.didChange) {
      await this.args.didChange(publicationStatusChange);
    }
  }
}
