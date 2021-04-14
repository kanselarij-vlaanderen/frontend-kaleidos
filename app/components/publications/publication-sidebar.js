import Component from '@glimmer/component';
import {
  action,
  set
} from '@ember/object';
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
   * @argument didChange: should take arguments (modifiedObject, keyName, newValue)
   */
  @service store;
  @service intl;
  @service toaster;
  @service publicationService;

  // Tracked props.
  @tracked publicationNotAfterTranslationForPublication = false;
  @tracked publicationNotAfterTranslationForTranslation = false;
  @tracked showTranslationDatePicker = true;
  @tracked showPublicationDatePicker = true;
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

  get getClassForPublicationNumber() {
    if (this.numberIsAlreadyUsed) {
      return 'auk-form-group--error';
    }
    return null;
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
    this.publicationFlow.set('regulationType', regulationType);
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'regulationType', regulationType);
    }
  }

  get getPublicationType() {
    return this.typeOptions.find((typeOption) => typeOption.id === this.publicationFlow.get('type.id'));
  }

  @action
  async setPublicationType(pojoType) {
    const publicationType = await this.store.findRecord('publication-type', pojoType.id);
    this.publicationFlow.set('type', publicationType);
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'type', publicationType);
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
      this.publicationFlow.set('status', publicationStatus);
      if (this.args.didChange) {
        await this.args.didChange(this.publicationFlow, 'status', publicationStatus);
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
    this.publicationFlow.set('status', publicationStatus);
    if (this.args.didChange) {
      await this.args.didChange(this.publicationFlow, 'status', publicationStatus);
    }
    this.showConfirmWithdraw = false;
  }

  get getTranslationDate() {
    if (!this.publicationFlow.get('translateBefore')) {
      return null;
    }
    return this.publicationFlow.get('translateBefore');
  }

  get getPublicationBeforeDate() {
    if (!this.publicationFlow.get('publishBefore')) {
      return null;
    }
    return this.publicationFlow.get('publishBefore');
  }

  get getRequestedPublicationDate() {
    if (!this.publicationFlow.get('publishDateRequested')) {
      return null;
    }
    return this.publicationFlow.get('publishDateRequested');
  }

  get getPublicationDate() {
    if (!this.publicationFlow.get('publishedAt')) {
      return null;
    }
    return this.publicationFlow.get('publishedAt');
  }

  get expiredPublicationBeforeDate() {
    if (this.publicationFlow.get('publishBefore')) {
      return moment(this.publicationFlow.get('publishBefore'))
        .isBefore(moment());
    }
    return false;
  }

  get expiredPublicationDate() {
    if (this.publicationFlow.get('publishedAt')) {
      return moment(this.publicationFlow.get('publishedAt'))
        .isBefore(moment());
    }
    return false;
  }

  get expiredTranslationDate() {
    if (this.publicationFlow.get('translateBefore')) {
      return moment(this.publicationFlow.get('translateBefore'))
        .isBefore(moment());
    }
    return false;
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
    const publicationSuffix = this.publicationFlow.get('publicationSuffix');
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
        event.target.value = this.publicationFlow.get('publicationNumber') || '';
      } else {
        const number = parseInt(event.target.value, 10);
        this.publicationFlow.set('publicationNumber', number);
        this.numberIsAlreadyUsed = false;
        if (this.args.didChange) {
          this.args.didChange(this.publicationFlow, 'publicationNumber', number);
        }
      }
    });
  }

  @restartableTask
  *setPublicationSuffix(event) {
    yield timeout(1000);
    this.numberIsAlreadyUsed = false;
    const publicationNumber = this.publicationFlow.get('publicationNumber');
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
        event.target.value = this.publicationFlow.get('publicationSuffix') || '';
      } else {
        // TODO trimText here to remove spaces, enters ?
        if (event.target.value !== '') {
          this.publicationFlow.set('publicationSuffix', event.target.value);
        } else {
          this.publicationFlow.set('publicationSuffix', undefined);
        }
        this.numberIsAlreadyUsed = false;
        if (this.args.didChange) {
          this.args.didChange(this.publicationFlow, 'publicationSuffix', event.target.value);
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
    if (this.publicationFlow.get('hasPriority')) {
      this.publicationFlow.set('priority', 0);
    } else {
      this.publicationFlow.set('priority', 1);
    }
    this.publicationFlow.save();
  }

  @action
  allowedTranslationDate(date) {
    // If translateBefore has expired, show that date (input is empty without this)
    const translateBefore = this.publicationFlow.get('translateBefore');
    if (translateBefore && moment(translateBefore).isBefore(moment())) {
      if (moment(date).isSame(translateBefore)) {
        return true;
      }
    }
    // If there is no publishBefore, allow all future dates
    const publishBefore = this.publicationFlow.get('publishBefore');
    if (!publishBefore && moment(date).isSameOrAfter(moment())) {
      return true;
    }
    // If there is a publishbefore, only allow dates between now and that date
    const end = moment(publishBefore);
    if (moment(date).isSameOrBefore(end) && moment(date).isSameOrAfter(moment())) {
      return true;
    }
    return false;
  }

  @action
  allowedPublicationDate(date) {
    const end = moment().add(360, 'days');
    let startRange;
    const translateBefore = this.publicationFlow.get('translateBefore');
    if (translateBefore && moment(translateBefore).isSameOrAfter(moment())) {
      startRange = moment(translateBefore);
    } else {
      startRange = moment();
    }
    if (moment(date).isSameOrBefore(end) && moment(date).isSameOrAfter(startRange)) {
      return true;
    }
    return false;
  }

  @action
  setPublicationBeforeDate(event) {
    set(this, 'showPublicationDatePicker', false);
    set(this, 'showTranslationDatePicker', false);
    const date = moment(new Date(event));
    const translateBefore = this.publicationFlow.get('translateBefore');
    if (translateBefore !== undefined && !moment(translateBefore).isSameOrBefore(date, 'minutes')) {
      this.publicationNotAfterTranslationForPublication = true;
      this.toaster.error(this.intl.t('publication-date-after-translation-date'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      set(this, 'showPublicationDatePicker', true);
      set(this, 'showTranslationDatePicker', true);
    } else {
      this.publicationFlow.set('publishBefore', new Date(event));
      this.publicationFlow.save().then(() => {
        set(this, 'showPublicationDatePicker', true);
        set(this, 'showTranslationDatePicker', true);
      }).
        catch(() => {
          set(this, 'showPublicationDatePicker', true);
          set(this, 'showTranslationDatePicker', true);
        });
      this.publicationNotAfterTranslationForPublication = false;
    }
  }

  @action
  setRequestedPublicationDate(event) {
    this.publicationFlow.set('publishDateRequested', new Date(event));
    this.publicationFlow.save();
  }

  @action
  setPublicationDate(event) {
    this.publicationFlow.set('publishedAt', new Date(event));
    this.publicationFlow.save();
  }

  @action
  setTranslationDate(event) {
    set(this, 'showPublicationDatePicker', false);
    set(this, 'showTranslationDatePicker', false);
    const date = moment(new Date(event));
    const publishBefore = this.publicationFlow.get('publishBefore');
    if (publishBefore !== undefined && !moment(date).isSameOrBefore(publishBefore)) {
      this.publicationNotAfterTranslationForTranslation = true;
      this.toaster.error(this.intl.t('publication-date-after-translation-date'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      set(this, 'showPublicationDatePicker', true);
      set(this, 'showTranslationDatePicker', true);
    } else {
      this.publicationFlow.set('translateBefore', new Date(event));
      this.publicationFlow.save().then(() => {
        set(this, 'showPublicationDatePicker', true);
        set(this, 'showTranslationDatePicker', true);
      }).
        catch(() => {
          set(this, 'showPublicationDatePicker', true);
          set(this, 'showTranslationDatePicker', true);
        });
      this.publicationNotAfterTranslationForTranslation = false;
    }
  }

  // Overwrite from datepicker cant be renamed
  @action
  toggle() {
    this.showPicker = !this.showPicker;
  }

  @restartableTask
  *setRemark(event) {
    const newValue = event.target.value;
    this.publicationFlow.set('remark', newValue);
    yield timeout(1000);
    if (this.args.didChange) {
      this.args.didChange(this.publicationFlow, 'remark', newValue);
    }
  }
}
