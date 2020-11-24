import Controller from '@ember/controller';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'fe-redpencil/utils/config';
import { action } from '@ember/object';
import moment from 'moment';

export default class PublicationController extends Controller {
  @tracked collapsed = true;
  @tracked publicationNumber;
  @tracked translationDate;
  @tracked publicationBeforeDate;
  @tracked publicationDate;
  @tracked numacNumber;
  @tracked remark;
  @tracked publicationForm;

  @tracked showToPublish = true;
  @tracked published = false;

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
  ]

  get getShortTitle() {
    const caze = this.model.get('case');
    return caze.get('shortTitle');
  }

  get getPublicationNumber() {
    return `PUBLICATIE ${this.model.get('publicationNumber')}`.toString()
      .toUpperCase();
  }

  // TODO get status
  // TODO set selected item from the status value
  get getPublicationStatus() {
    console.log(this.model);
    console.log(this.model.get('status'));

    // TODO Fix data error
    const status =  this.model.get('status').then((status) => this.statusOptions.find((statusOption) => statusOption.id === status.id));
    // const x = this.statusOptions.find((statusOption) => statusOption.id === this.model.get('status.id'));
    console.log('STATUS', status);
    return status;
  }

  get getPublicationType() {
    const foundOption = this.typeOptions.find((typeOption) => typeOption.id === this.model.get('type.id'));
    console.log('TYPE', foundOption);
    return foundOption;
  }

  get getPublicationNumberSidePanel() {
    return this.model.get('publicationNumber');
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

  get getNumacNumber() {
    return this.model.get('numacNumber');
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
    this.publicationNumber = event.target.value;
    this.model.set('publicationNumber', this.publicationNumber);
    yield timeout(1000);
    this.model.save();
  }

  @restartableTask
  *setNumacNumber(event) {
    this.numacNumber = event.target.value;
    this.model.set('numacNumber', this.numacNumber);
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
    if (event.label === 'Gepubliceerd') {
      this.showToPublish = false;
      this.published = true;
    } else {
      this.showToPublish = true;
      this.published = false;
    }
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
    this.remarks = event.target.value;
    this.model.set('remark', this.remarks);
    yield timeout(1000);
    this.model.save();
  }

  @action
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  @action
  toggle() {
    this.showPicker = !this.showPicker;
  }
}
