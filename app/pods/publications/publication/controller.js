import Controller from '@ember/controller';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'frontend-kaleidos/utils/config';
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
  @tracked numberIsRequired = false;
  @tracked publicationNotAfterTranslationForPublication = false;
  @tracked publicationNotAfterTranslationForTranslation = false;
  @tracked collapsed = !this.get('media.isBigScreen');
  @tracked showTranslationDatePicker = true;
  @tracked showPublicationDatePicker = true;
  @tracked showRequestedPublicationDatePicker = true;
  @tracked showConfirmWithdraw = false;
  @tracked selectedDocumentType;
  @tracked newNumacNumber = '';
  @tracked showLoader = false;

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
    id: CONFIG.publicationStatusPauzed.id,
    label: 'Gepauzeerd',
    icon: {
      svg: 'circle-pause',
      color: 'muted',
    },
  }, {
    id: CONFIG.publicationStatusWithdrawn.id,
    label: 'Afgevoerd',
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

  get sortedDocumentTypes() {
    return this.model.documentTypes.sortBy('priority');
  }

  @action
  selectDocumentType(documentType) {
    this.model.publicationFlow.set('deducedType', documentType);
    this.model.publicationFlow.save();
  }

  get getSelectedDocumentType() {
    return this.model.documentTypes.find((documentType) => documentType.id === this.model.publicationFlow.get('deducedType.id'));
  }

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

  get getRequestedPublicationDate() {
    if (!this.model.publicationFlow.get('publishDateRequested')) {
      return null;
    }
    return this.model.publicationFlow.get('publishDateRequested');
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
  get titleText() {
    const shortTitle = this.model.publicationFlow.case.get('shortTitle');
    if (shortTitle) {
      return shortTitle;
    }
    return this.model.publicationFlow.case.get('title');
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

  get casePath() {
    let title = this.intl.t('publication-flow');
    // TODO use publicationNumberToDisplay here, but doesn't seem to update when changing suffix
    if (!this.model.latestSubcaseOnMeeting) {
      title = title.concat(' - ', this.intl.t('not-via-cabinet'), ' - ', this.model.publicationFlow.publicationNumber, ' ', this.model.publicationFlow.publicationSuffix || '');
    } else {
      title = title.concat(' - ', this.intl.t('via-cabinet'), ' - ', this.model.publicationFlow.publicationNumber, ' ', this.model.publicationFlow.publicationSuffix || '');
    }
    return title;
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
    this.numberIsRequired = false;
    this.numberIsAlreadyUsed = false;
    if (event.target.value === '') {
      this.numberIsRequired = true;
      this.toaster.error(this.intl.t('publication-number-required'), this.intl.t('warning-title'), {
        timeOut: 5000,
      });
      return;
    }
    const publicationSuffix = this.model.publicationFlow.get('publicationSuffix');
    this.publicationService.publicationNumberAlreadyTaken(event.target.value, publicationSuffix, this.model.publicationFlow.id).then((isPublicationNumberTaken) => {
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
        event.target.value = this.model.publicationFlow.get('publicationNumber') || '';
      } else {
        this.model.publicationFlow.set('publicationNumber', parseInt(event.target.value, 10));
        this.numberIsAlreadyUsed = false;
        this.model.publicationFlow.save();
      }
    });
  }

  @restartableTask
  *setPublicationSuffix(event) {
    yield timeout(1000);
    this.numberIsAlreadyUsed = false;
    const publicationNumber = this.model.publicationFlow.get('publicationNumber');
    this.publicationService.publicationNumberAlreadyTaken(publicationNumber, event.target.value, this.model.publicationFlow.id).then((isPublicationNumberTaken) => {
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
        event.target.value = this.model.publicationFlow.get('publicationSuffix') || '';
      } else {
        // TODO trimText here to remove spaces, enters ?
        if (event.target.value !== '') {
          this.model.publicationFlow.set('publicationSuffix', event.target.value);
        } else {
          this.model.publicationFlow.set('publicationSuffix', undefined);
        }
        this.numberIsAlreadyUsed = false;
        this.model.publicationFlow.save();
      }
    });
  }

  get numacNumbers() {
    if (this.model.publicationFlow.numacNumbers) {
      return this.model.publicationFlow.numacNumbers;
    }
    return false;
  }

  @action
  setNumacNummer(event) {
    this.newNumacNumber = event.target.value;
  }

  @action
  async addNumacNumber() {
    this.set('showLoader', true);
    await this.publicationService.createNumacNumber(this.newNumacNumber, this.model.publicationFlow);
    this.set('newNumacNumber', '');
    this.set('showLoader', false);
  }

  @action
  async deleteNumacNumber(numacNumber) {
    this.set('showLoader', true);
    await this.publicationService.unlinkNumacNumber(numacNumber, this.model.publicationFlow);
    this.set('showLoader', false);
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
  setRequestedPublicationDate(event) {
    this.model.publicationFlow.set('publishDateRequested', new Date(event));
    this.model.publicationFlow.save();
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
  get documentsCount() {
    return `(${this.model.counts.documentCount})`;
  }

  get showStatusForTranslations() {
    const totalTranslations = this.model.counts.totalTranslations;
    const closedOrWithdrawn = this.model.counts.closedOrWithdrawnTranslationRequests;
    const openTranslation = this.model.counts.openTranslationRequests;

    // Er zijn geen translations aangemaakt.
    if (totalTranslations === 0) {
      return {
        status: 'not-started',
      };
    }

    // Er is 1 open translation, toon enkel de icon
    if (openTranslation === 1 && (totalTranslations === 1)) {
      return {
        status: '',
      };
    }

    // Er zijn nog open statussen
    if (openTranslation !== 0) {
      return {
        value: `${closedOrWithdrawn}/${totalTranslations}`,
      };
    }

    // Alle requests zijn afgehandeld.
    if (totalTranslations === closedOrWithdrawn) {
      return {
        status: 'done',
      };
    }
    return null;
  }

  get showStatusForPublicationPreviews() {
    const totalPublishPreviewRequests = this.model.counts.totalPublishPreviewRequests;
    const closedOrWithdrawnPublishPrevieuwRequests = this.model.counts.closedOrWithdrawnPublishPrevieuwRequests;
    const openPublishPreviewRequests = this.model.counts.openPublishPreviewRequests;

    // Er zijn geen translations aangemaakt.
    if (totalPublishPreviewRequests === 0) {
      return {
        status: 'not-started',
      };
    }

    // Er is 1 open translation en er is maar 1 publishpreview, toon enkel de icon
    if (openPublishPreviewRequests === 1 && (totalPublishPreviewRequests === 1)) {
      return {
        status: '',
      };
    }

    // Er zijn nog open statussen
    if (openPublishPreviewRequests !== 0) {
      return {
        value: `${closedOrWithdrawnPublishPrevieuwRequests}/${totalPublishPreviewRequests}`,
      };
    }

    // Alle requests zijn afgehandeld.
    if (totalPublishPreviewRequests === closedOrWithdrawnPublishPrevieuwRequests) {
      return {
        status: 'done',
      };
    }
    return null;
  }
}
