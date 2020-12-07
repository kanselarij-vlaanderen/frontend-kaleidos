import Controller from '@ember/controller';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'fe-redpencil/utils/config';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  @tracked collapsed = !this.get('media.isBigScreen');
  @tracked numberIsAlreadyUsed = false;
  @service publicationService;
  @service toaster;
  @service intl;

  statusOptions = [{
    id: CONFIG.publicationStatusToPublish.id,
    label: 'Te publiceren',
  }, {
    id: CONFIG.publicationStatusPublished.id,
    label: 'Gepubliceerd',
  }]

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

  @restartableTask
  *setPublicationNumber(event) {
    const currentActivePublicationNumber = this.model.publicationNumber;
    console.log('currentActivePublicationNumber', currentActivePublicationNumber);
    this.publicationService.publicationNumberAlreadyTaken(event.target.value).then((isPublicationNumberTaken) => {
      if (isPublicationNumberTaken) {
        this.numberIsAlreadyUsed = true;
        this.toaster.error(this.intl.t('publication-number-already-taken'), this.intl.t('warning-title'), {
          timeOut: 10000,
        });
      } else {
        this.model.set('publicationNumber',  event.target.value);
        this.numberIsAlreadyUsed = false;
        this.model.save();
      }
    });
    yield timeout(1000);
  }

  @restartableTask
  *setNumacNumber(event) {
    this.model.set('numacNumber', event.target.value);
    yield timeout(1000);
    this.model.save();
  }

  @action
  setPublicationBeforeDate(event) {
    this.model.set('publishBefore', new Date(event));
    this.model.save();
  }

  @action
  setPublicationDate(event) {
    this.model.set('publishedAt', new Date(event));
    this.model.save();
  }

  @action
  setTranslationDate(event) {
    this.model.set('translateBefore', new Date(event));
    this.model.save();
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
