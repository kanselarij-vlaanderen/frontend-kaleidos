import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;

  async createNewPublicationFromMinisterialCouncil(publicationProperties, decisionOptions) {
    return this.createNewPublication(publicationProperties, decisionOptions);
  }

  async createNewPublicationWithoutMinisterialCouncil(publicationProperties) {
    return this.createNewPublication(publicationProperties);
  }

  /**
   *
   * @param {{
   *  shortTitle: string,
   *  longTitle: string,
   *  number: number,
   *  suffix: string,
   *  publicationDueDate: Date,
   * }} publicationProperties
   * @param {{
   *  case: Case,
   * }|undefined} decisionOptions passed when via ministerial council
   * @returns {PublicationFlow}
   * @private
   */
  async createNewPublication(publicationProperties, decisionOptions) {
    const now = new Date();
    let case_;
    if (decisionOptions) {
      case_ = decisionOptions.case;
    } else {
      case_ = this.store.createRecord('case', {
        shortTitle: publicationProperties.shortTitle,
        title: publicationProperties.longTitle,
        created: now,
      });
      await case_.save();
    }

    const toPublishStatus = await this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.PENDING);

    const structuredIdentifier = this.store.createRecord('structured-identifier', {
      localIdentifier: publicationProperties.number,
      versionIdentifier: publicationProperties.suffix,
    });
    await structuredIdentifier.save();

    let identificationNumber = publicationProperties.number;
    if (publicationProperties.suffix && publicationProperties.suffix.length > 0) {
      identificationNumber += ` ${publicationProperties.suffix}`;
    }

    const identifier = this.store.createRecord('identification', {
      idName: identificationNumber,
      agency: CONSTANTS.SCHEMA_AGENCIES.OVRB,
      structuredIdentifier: structuredIdentifier,
    });
    await identifier.save();

    const statusChange = this.store.createRecord('publication-status-change', {
      startedAt: now,
    });
    await statusChange.save();
    const publicationFlow = this.store.createRecord('publication-flow', {
      identification: identifier,
      case: case_,
      statusChange: statusChange,
      created: now,
      openingDate: now,
      status: toPublishStatus,
      modified: now,
    });
    await publicationFlow.save();
    const translationSubcase = this.store.createRecord('translation-subcase', {
      created: now,
      modified: now,
      publicationFlow,
    });
    const publicationSubcase = this.store.createRecord('publication-subcase', {
      created: now,
      modified: now,
      dueDate: publicationProperties.publicationDueDate,
      publicationFlow,
    });
    await Promise.all([translationSubcase.save(), publicationSubcase.save()]);
    return publicationFlow;
  }

  async linkContactPersonToPublication(publicationId, contactPerson) {
    const publicationFlow = await this.store.findRecord('publication-flow', publicationId, {
      include: 'contact-persons',
    });
    const contactPersonList = await publicationFlow.get('contactPersons');
    contactPersonList.pushObject(contactPerson);
    publicationFlow.set('contactPersons', contactPersonList);
    publicationFlow.save().then(() => {
      this.toaster.success(this.intl.t('contact-added-toast-message'), this.intl.t('contact-added-toast-title'));
      publicationFlow.hasMany('contactPersons').reload();
    })
      .catch(() => {
        // TODO: Functionele logging hier toevoegen
        this.toaster.error(this.intl.t('contact-added-toast-error-message'), this.intl.t('toast-error-title'));
      });
  }

  async publicationNumberAlreadyTaken(publicationNumber, publicationSuffix, publicationFlowId) {
    let identificationNumber = publicationNumber;
    if (publicationSuffix && publicationSuffix.length > 0) {
      identificationNumber += ` ${publicationSuffix}`;
    }

    const duplicates = await this.store.query('publication-flow', {
      filter: {
        identification: {
          ':exact:id-name': identificationNumber,
        },
      },
    });

    // our own publication should not be considered as duplicate
    return duplicates.filter((publication) => publication.id !== publicationFlowId).length > 0;
  }
}
