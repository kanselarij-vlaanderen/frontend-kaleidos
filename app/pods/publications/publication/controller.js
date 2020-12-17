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
  // Tracked.
  @tracked numberIsAlreadyUsed = false;
  @tracked publicationNotAfterTranslationForPublication = false;
  @tracked publicationNotAfterTranslationForTranslation = false;
  @tracked collapsed = !this.get('media.isBigScreen');
  @tracked showTranslationDatePicker = true;
  @tracked showPublicationDatePicker = true;


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
    return this.statusOptions.find((statusOption) => statusOption.id === this.model.get('status.id'));
  }

  get getPublicationType() {
    return this.typeOptions.find((typeOption) => typeOption.id === this.model.get('type.id'));
  }

  get getTranslationDate() {
    if (!this.model.get('translateBefore')) {
      return null;
    }
    return this.model.get('translateBefore');
  }

  get getPublicationBeforeDate() {
    if (!this.model.get('publishBefore')) {
      return null;
    }
    return this.model.get('publishBefore');
  }

  get getPublicationDate() {
    if (!this.model.get('publishedAt')) {
      return null;
    }
    return this.model.get('publishedAt');
  }

  get getRemark() {
    return this.model.get('remark');
  }

  get expiredPublicationBeforeDate() {
    return moment(this.model.get('publishBefore'))
      .isBefore(moment());
  }
  get expiredPublicationDate() {
    return moment(this.model.get('publishedAt'))
      .isBefore(moment());
  }
  get expiredTranslationDate() {
    return moment(this.model.get('translateBefore'))
      .isBefore(moment());
  }

  @action
  allowedTranslationDate(date) {
    const end = moment(this.model.get('publishBefore'));
    if (moment(date).isSameOrBefore(end) && moment(date).isSameOrAfter(moment())) {
      return true;
    }
    return false;
  }

  @action
  allowedPublicationDate(date) {
    const end = moment().add(360, 'days');
    let startRange;
    if (this.model.get('translateBefore')) {
      startRange = moment(this.model.get('translateBefore'));
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
    this.publicationService.publicationNumberAlreadyTaken(event.target.value, this.model.id).then((isPublicationNumberTaken) => {
      if (isPublicationNumberTaken) {
        this.numberIsAlreadyUsed = true;
        this.toaster.error(this.intl.t('publication-number-already-taken'), this.intl.t('warning-title'), {
          timeOut: 5000,
        });
      } else {
        this.model.set('publicationNumber',  event.target.value);
        this.numberIsAlreadyUsed = false;
        this.model.save();
      }
    });
  }

  @restartableTask
  *setNumacNumber(event) {
    this.model.set('numacNumber', event.target.value);
    yield timeout(1000);
    this.model.save();
  }

  @action
  setPublicationBeforeDate(event) {
    set(this, 'showPublicationDatePicker', false);
    set(this, 'showTranslationDatePicker', false);
    const date = moment(new Date(event));
    const translateBefore = this.model.get('translateBefore');
    if (typeof translateBefore !== undefined && !moment(translateBefore).isSameOrBefore(date, 'minutes')) {
      this.publicationNotAfterTranslationForPublication = true;
      this.toaster.error(this.intl.t('publication-date-after-translation-date'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      set(this, 'showPublicationDatePicker', true);
      set(this, 'showTranslationDatePicker', true);
    } else {
      this.model.set('publishBefore', new Date(event));
      this.model.save().then(() => {
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
    this.model.set('publishedAt', new Date(event));
    this.model.save();
  }

  @action
  setTranslationDate(event) {
    set(this, 'showPublicationDatePicker', false);
    set(this, 'showTranslationDatePicker', false);
    const date = moment(new Date(event));
    const publishBefore = this.model.get('publishBefore');
    if (typeof publishBefore !== undefined && !moment(date).isSameOrBefore(publishBefore)) {
      this.publicationNotAfterTranslationForTranslation = true;
      this.toaster.error(this.intl.t('publication-date-after-translation-date'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      set(this, 'showPublicationDatePicker', true);
      set(this, 'showTranslationDatePicker', true);
    } else {
      this.model.set('translateBefore', new Date(event));
      this.model.save().then(() => {
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

  // TODO change this
  @action
  async setPublicationStatus(event) {
    const publicationStatus = await this.store.findRecord('publication-status', event.id);
    this.model.set('status', publicationStatus);
    this.model.save();
  }

  @action
  async setPublicationType(event) {
    const publicationType = await this.store.findRecord('publication-type', event.id);
    this.model.set('type', publicationType);
    this.model.save();
  }

  @restartableTask
  *setRemark(event) {
    this.model.set('remark', event.target.value);
    yield timeout(1000);
    this.model.save();
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
