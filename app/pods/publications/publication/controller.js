import Controller from '@ember/controller';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'fe-redpencil/utils/config';
import {
  action,
  set
} from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  // Services.
  @service publicationService;
  @service toaster;
  @service intl;
  @service media;

  // Tracked props.
  @tracked numberIsAlreadyUsed = false;
  @tracked publicationNotAfterTranslationForPublication = false;
  @tracked publicationNotAfterTranslationForTranslation = false;
  @tracked collapsed = !this.get('media.isBigScreen');
  @tracked showTranslationDatePicker = true;
  @tracked showPublicationDatePicker = true;
  @tracked showConfirmWithdraw = false;


  statusOptions = [{
    id: CONFIG.publicationStatusToPublish.id,
    label: 'Te publiceren',
    icon: {
      svg: 'clock',
      color: 'warning',
    },
  }, {
    id: CONFIG.publicationStatusPublished.id,
    label: 'Gepubliceerd',
    icon: {
      svg: 'circle-check',
      color: 'success',
    },
  }, {
    id: CONFIG.publicationStatusWithdrawn.id,
    label: 'ingetrokken',
    icon: {
      svg: 'circle-close',
      color: 'danger',
    },
  }];

  typeOptions = [
    {
      id: CONFIG.PUBLICATION_TYPES.extenso.id,
      label: 'Extenso',
    }, {
      id: CONFIG.PUBLICATION_TYPES.bijUitreksel.id,
      label: 'Bij uitreksel',
    }
  ];

  get getPublicationStatus() {
    return this.statusOptions.find((statusOption) => statusOption.id === this.model.publicationFlow.get('status.id'));
  }

  get getPublicationType() {
    return this.typeOptions.find((typeOption) => typeOption.id === this.model.publicationFlow.get('type.id'));
  }

  get getTranslationDate() {
    if (!this.model.publicationFlow.get('translateBefore')) {
      return null;
    }
    return this.model.publicationFlow.get('translateBefore');
  }

  get getPublicationBeforeDate() {
    if (!this.model.publicationFlow.get('publishBefore')) {
      return null;
    }
    return this.model.publicationFlow.get('publishBefore');
  }

  get getPublicationDate() {
    if (!this.model.publicationFlow.get('publishedAt')) {
      return null;
    }
    return this.model.publicationFlow.get('publishedAt');
  }

  get getRemark() {
    return this.model.publicationFlow.get('remark');
  }

  get expiredPublicationBeforeDate() {
    if (this.model.publicationFlow.get('publishBefore')) {
      return moment(this.model.publicationFlow.get('publishBefore'))
        .isBefore(moment());
    }
    return false;
  }

  get expiredPublicationDate() {
    if (this.model.publicationFlow.get('publishedAt')) {
      return moment(this.model.publicationFlow.get('publishedAt'))
        .isBefore(moment());
    }
    return false;
  }

  get expiredTranslationDate() {
    if (this.model.publicationFlow.get('translateBefore')) {
      return moment(this.model.publicationFlow.get('translateBefore'))
        .isBefore(moment());
    }
    return false;
  }

  @action
  allowedTranslationDate(date) {
    const end = moment(this.model.publicationFlow.get('publishBefore'));
    if (moment(date).isSameOrBefore(end) && moment(date).isSameOrAfter(moment())) {
      return true;
    }
    return false;
  }

  @action
  allowedPublicationDate(date) {
    const end = moment().add(360, 'days');
    let startRange;
    if (this.model.publicationFlow.get('translateBefore')) {
      startRange = moment(this.model.publicationFlow.get('translateBefore'));
    } else {
      startRange = moment();
    }
    if (moment(date).isSameOrBefore(end) && moment(date).isSameOrAfter(startRange)) {
      return true;
    }
    return false;
  }

  @restartableTask
  *setPublicationNumber(event) {
    yield timeout(1000);
    this.publicationService.publicationNumberAlreadyTaken(event.target.value, this.model.publicationFlow.id).then((isPublicationNumberTaken) => {
      if (isPublicationNumberTaken) {
        this.numberIsAlreadyUsed = true;
        this.toaster.error(this.intl.t('publication-number-already-taken'), this.intl.t('warning-title'), {
          timeOut: 5000,
        });
      } else {
        this.model.publicationFlow.set('publicationNumber', event.target.value);
        this.numberIsAlreadyUsed = false;
        this.model.publicationFlow.save();
      }
    });
  }

  @restartableTask
  *setNumacNumber(event) {
    this.model.publicationFlow.set('numacNumber', event.target.value);
    yield timeout(1000);
    this.model.publicationFlow.save();
  }

  @action
  togglePriorityProcedure() {
    if (this.model.publicationFlow.get('hasPriority')) {
      this.model.publicationFlow.set('priority', 0);
    } else {
      this.model.publicationFlow.set('priority', 1);
    }
    this.model.publicationFlow.save();
  }

  @action
  setPublicationBeforeDate(event) {
    set(this, 'showPublicationDatePicker', false);
    set(this, 'showTranslationDatePicker', false);
    const date = moment(new Date(event));
    const translateBefore = this.model.publicationFlow.get('translateBefore');
    if (typeof translateBefore !== undefined && !moment(translateBefore).isSameOrBefore(date, 'minutes')) {
      this.publicationNotAfterTranslationForPublication = true;
      this.toaster.error(this.intl.t('publication-date-after-translation-date'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      set(this, 'showPublicationDatePicker', true);
      set(this, 'showTranslationDatePicker', true);
    } else {
      this.model.publicationFlow.set('publishBefore', new Date(event));
      this.model.publicationFlow.save().then(() => {
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
  setPublicationDate(event) {
    this.model.publicationFlow.set('publishedAt', new Date(event));
    this.model.publicationFlow.save();
  }

  @action
  setTranslationDate(event) {
    set(this, 'showPublicationDatePicker', false);
    set(this, 'showTranslationDatePicker', false);
    const date = moment(new Date(event));
    const publishBefore = this.model.publicationFlow.get('publishBefore');
    if (typeof publishBefore !== undefined && !moment(date).isSameOrBefore(publishBefore)) {
      this.publicationNotAfterTranslationForTranslation = true;
      this.toaster.error(this.intl.t('publication-date-after-translation-date'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      set(this, 'showPublicationDatePicker', true);
      set(this, 'showTranslationDatePicker', true);
    } else {
      this.model.publicationFlow.set('translateBefore', new Date(event));
      this.model.publicationFlow.save().then(() => {
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

  @action
  cancelWithdraw() {
    this.showConfirmWithdraw = false;
  }

  @action
  async withdrawPublicationFlow() {
    const publicationStatus = await this.store.findRecord('publication-status', CONFIG.publicationStatusWithdrawn.id);
    this.model.publicationFlow.set('status', publicationStatus);
    await this.model.publicationFlow.save();
    this.showConfirmWithdraw = false;
  }

  @action
  async setPublicationStatus(event) {
    if (event.id === CONFIG.publicationStatusWithdrawn.id) {
      // Show popup and do nothing.
      this.showConfirmWithdraw = true;
    } else {
      const publicationStatus = await this.store.findRecord('publication-status', event.id);
      this.model.publicationFlow.set('status', publicationStatus);
      this.model.publicationFlow.save();
    }
  }

  @action
  async setPublicationType(event) {
    const publicationType = await this.store.findRecord('publication-type', event.id);
    this.model.publicationFlow.set('type', publicationType);
    this.model.publicationFlow.save();
  }

  @restartableTask
  *setRemark(event) {
    this.model.publicationFlow.set('remark', event.target.value);
    yield timeout(1000);
    this.model.publicationFlow.save();
  }

  @action
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  // Overwrite from datepicker cant be renamed
  @action
  toggle() {
    this.showPicker = !this.showPicker;
  }

  get getClassForPublicationNumber() {
    if (this.numberIsAlreadyUsed) {
      return 'auk-form-group--error';
    }
    return null;
  }
}
