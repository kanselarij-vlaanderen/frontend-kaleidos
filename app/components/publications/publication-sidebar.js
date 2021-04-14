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
import moment from 'moment';
import CONFIG from 'frontend-kaleidos/utils/config';

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
  @tracked showRequestedPublicationDatePicker = true;
  @tracked selectedRegulatonType;
  @tracked newNumacNumber = '';
  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;
  @tracked showConfirmWithdraw = false;

  @lastValue('loadRegulationTypes') regulationTypes;

  statusOptions = [
    {
      id: CONFIG.publicationStatusToPublish.id,
      label: 'Te publiceren',
      icon: {
        svg: 'clock',
        color: 'warning',
      },
    },
    {
      id: CONFIG.publicationStatusPublished.id,
      label: 'Gepubliceerd',
      icon: {
        svg: 'circle-check',
        color: 'success',
      },
    },
    {
      id: CONFIG.publicationStatusPauzed.id,
      label: 'Gepauzeerd',
      icon: {
        svg: 'circle-pause',
        color: 'muted',
      },
    },
    {
      id: CONFIG.publicationStatusWithdrawn.id,
      label: 'Afgevoerd',
      icon: {
        svg: 'circle-error',
        color: 'danger',
      },
    }
  ];

  typeOptions = [
    {
      id: CONFIG.PUBLICATION_TYPES.extenso.id,
      label: 'Extenso',
    },
    {
      id: CONFIG.PUBLICATION_TYPES.bijUitreksel.id,
      label: 'Bij uitreksel',
    }
  ];

  constructor() {
    super(...arguments);
    this.loadRegulationTypes.perform();
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

  @action
  setRegulationType(regulationType) {
    this.publicationFlow.regulationType = regulationType;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'regulationType');
    }
  }

  get getPublicationType() {
    return this.typeOptions.find((typeOption) => typeOption.id === this.publicationFlow.get('type.id'));
  }

  @action
  async setPublicationType(pojoType) {
    const publicationType = await this.store.findRecord('publication-type', pojoType.id);
    this.publicationFlow.type = publicationType;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'type');
    }
  }

  get getPublicationStatus() {
    return this.statusOptions.find((statusOption) => statusOption.id === this.publicationFlow.get('status.id'));
  }

  @action
  async setPublicationStatus(pojoStatus) {
    if (pojoStatus.id === CONFIG.publicationStatusWithdrawn.id) {
      // Show popup and do nothing.
      this.showConfirmWithdraw = true;
    } else {
      const publicationStatus = await this.store.findRecord('publication-status', pojoStatus.id);
      this.publicationFlow.status = publicationStatus;
      if (this.args.didChange) {
        await this.args.didChange(this.publicationFlow, 'status');
      }
    }
  }

  @action
  cancelWithdraw() {
    this.showConfirmWithdraw = false;
  }

  @action
  async withdrawPublicationFlow() {
    const publicationStatus = await this.store.findRecord('publication-status', CONFIG.publicationStatusWithdrawn.id);
    this.publicationFlow.status = publicationStatus;
    if (this.args.didChange) {
      await this.args.didChange(this.publicationFlow, 'status');
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

  @action
  togglePriorityProcedure() {
    const priorityNumber = this.publicationFlow.hasPriority ? 0 : 1;
    this.publicationFlow.priority = priorityNumber;
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'priority');
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
