import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task, restartableTask } from 'ember-concurrency-decorators';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service intl;
  @service publicationService;

  @tracked isInEditMode;

  @tracked isUrgent;

  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;
  @tracked publicationNumber;
  @tracked publicationNumberSuffix;

  @tracked numacNumbers;
  @tracked decisionDate;
  @tracked openingDate;
  @tracked publicationDueDate;

  constructor() {
    super(...arguments);
  }

  @action
  async putInEditMode() {
    var publicationFlow = this.args.publicationFlow;
    this.isInEditMode = true;
    this.isUrgent = await this.publicationService.getIsUrgent(publicationFlow);
  }

  @action
  onChangeIsUrgent(ev) {
    var isUrgent = ev.target.checked;
    this.isUrgent = isUrgent;
  }

  @restartableTask
  *setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
    yield timeout(1000);
    this.numberIsRequired = false;
    this.numberIsAlreadyUsed = false;
    if (isBlank(this.publicationNumber)) {
      this.numberIsRequired = true;
      this.toaster.error(
        this.intl.t('publication-number-required'),
        this.intl.t('warning-title'),
        {
          timeOut: 5000,
        }
      );
    } else {
      this.setStructuredIdentifier();
    }
  }

  @restartableTask
  *setPublicationNumberSuffix(event) {
    this.publicationNumberSuffix = isBlank(event.target.value)
      ? undefined
      : event.target.value;
    yield timeout(1000);
    this.numberIsRequired = false;
    this.numberIsAlreadyUsed = false;
    this.setStructuredIdentifier();
  }

  async setStructuredIdentifier() {
    var publicationFlow = this.args.publicationFlow;
    const isPublicationNumberTaken =
      await this.publicationService.publicationNumberAlreadyTaken(
        this.publicationNumber,
        this.publicationNumberSuffix,
        publicationFlow.id
      );
    if (isPublicationNumberTaken) {
      this.numberIsAlreadyUsed = true;
      this.toaster.error(
        this.intl.t('publication-number-already-taken-with-params', {
          number: this.publicationNumber,
          suffix: isBlank(this.publicationNumberSuffix)
            ? this.intl.t('without-suffix')
            : `${this.intl.t('with-suffix')} '${this.publicationNumberSuffix}'`,
        }),
        this.intl.t('warning-title'),
        {
          timeOut: 5000,
        }
      );
    } else {
      const identification = await publicationFlow.identification;
      const structuredIdentifier = await identification.structuredIdentifier;
      const number = parseInt(this.publicationNumber, 10);
      structuredIdentifier.localIdentifier = number;
      structuredIdentifier.versionIdentifier = this.publicationNumberSuffix;
      identification.idName = this.publicationNumberSuffix
        ? `${number} ${this.publicationNumberSuffix}`
        : `${number}`;
      this.numberIsAlreadyUsed = false;
    }
  }

  @action
  cancelEdit() {
    this.showError = false;
    this.isInEditMode = false;
  }

  @task
  *save() {
    var publicationFlow = this.args.publicationFlow;
    yield this.performSave(publicationFlow);
    this.isInEditMode = false;
  }

  // separate method to avoid ember-concurrency from saving only partially
  async performSave(publicationFlow) {
    publicationFlow.urgencyLevel =
      await this.publicationService.getUrgencyLevel(this.isUrgent);
    await publicationFlow.save();
  }
}
