import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
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
  @tracked publicationStatus;
  @tracked publicationForm;

  @tracked showToPublish = true;
  @tracked published = false;

  get getShortTitle() {
    const caze = this.model.get('case');
    return caze.get('shortTitle');
  }

  get getPublicationNumber() {
    return `PUBLICATIE ${this.model.get('publicationNumber')}`.toString()
      .toUpperCase();
  }

  get getPublicationNumberSidePanel() {
    console.log('P number', this.model.get('publicationNumber'));
    if (this.model.get('publicationNumber')) {
      this.publicationNumber = this.model.get('publicationNumber');
    }
    return this.publicationNumber;
  }

  get getTranslationDate() {
    console.log('P translationDate', this.model.get('translateBefore'));
    if (this.model.get('translateBefore')) {
      const date = this.model.get('translateBefore');
      this.translationDate = moment(date).format('DD-MM-YYYY');
    }
    return this.translationDate;
  }

  get getPublicationBeforeDate() {
    console.log('P beforeDate', this.model.get('publishBefore'));
    if (this.model.get('publishBefore')) {
      const date  = this.model.get('publishBefore');
      this.publicationBeforeDate = moment(date).format('DD-MM-YYYY');
    }
    return this.publicationBeforeDate;
  }

  get getPublicationDate() {
    console.log('P publication date', this.model.get('publishedAt'));
    if (this.model.get('publishedAt')) {
      const date = this.model.get('publishedAt');
      this.publicationDate = moment(date).format('DD-MM-YYYY');
    }
    return this.publicationDate;
  }

  get getNumacNumber() {
    console.log('P munac number', this.model.get('numacNumber'));
    if (this.model.get('numacNumber')) {
      this.numacNumber = this.model.get('numacNumber');
    }
    return this.numacNumber;
  }

  get getRemark() {
    console.log('P remark', this.model.get('remark'));
    if (this.model.get('remark')) {
      this.remark = this.model.get('remark');
    }
    return this.remark;
  }

  @action
  setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
    this.model.set('publicationNumber', this.publicationNumber);
    this.model.save();
  }

  @action
  setPublicationDate(event) {
    this.publicationDate = moment(event.target.value).format('DD-MM-YYYY');
    console.log(this.publicationDate);
    this.model.set('publicationDate', this.publicationDate);
    this.model.save();
  }

  @action
  setNumacNumber(event) {
    this.numacNumber = event.target.value;
    this.model.set('numacNumber', this.numacNumber);
    this.model.save();
  }

  @action
  setPublicationBeforeDate(event) {
    this.publicationBeforeDate = new Date(event.target.value);
    this.model.set('publishBefore', this.publicationBeforeDate);
    this.model.save();
  }

  @action
  setTranslationDate(event) {
    this.translationDate = new Date(event.target.value);
    this.model.set('translateBefore', this.translationDate);
    this.model.save();
  }

  @action
  setPublicationStatus(event) {
    if (event.target.value === 'te publiceren') {
      this.showToPublish = true;
      this.published = false;
    } else {
      this.showToPublish = false;
      this.published = true;
    }
    this.publicationStatus = event.target.value;
    this.model.set('status', this.publicationStatus);
    this.model.save();
  }

  @action
  setPublicationForm(event) {
    this.publicationForm = event.target.value;
    this.model.set('type', this.publicationStatus);
    this.model.save();
  }

  @action
  setRemark(event) {
    this.remarks = event.target.value;
    this.model.set('remark', this.remarks);
    this.model.save();
  }

  @action
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  @action
  toggle() {
    this.showPicker = !this.showPicker;
    console.log('Show Picker', this.showPicker);
  }
}
