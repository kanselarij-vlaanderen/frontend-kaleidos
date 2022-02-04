import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;

  async createNewPublicationFromMinisterialCouncil(publicationProperties, decisionOptions) {
    return this.createNewPublication(publicationProperties, decisionOptions, undefined);
  }

  async createNewPublicationWithoutMinisterialCouncil(publicationProperties, decisionOptions) {
    return this.createNewPublication(publicationProperties, undefined, decisionOptions);
  }

  /**
   *
   * @param {{
   *  number: number,
   *  suffix: string,
   *  shortTitle: string,
   *  longTitle: string,
   *  publicationDueDate: Date,
   * }} publicationProperties
   * @param {{
   *  case: Case,
   *  agendaItemTreatment: AgendaItemTreatment,
   * }|undefined} viaCouncilOfMinisterOptions passed when via ministerial council
   * @param {undefined|{
   *  decisionDate: Date,
   * }} notViaCouncilOfMinistersOptions passed when not via council of ministers
   * @returns {PublicationFlow}
   * @private
   */
  async createNewPublication(publicationProperties, viaCouncilOfMinisterOptions, notViaCouncilOfMinistersOptions) {
    const now = new Date();

    let case_;
    let agendaItemTreatment;
    let mandatees;
    const isViaCouncilOfMinisters = !!viaCouncilOfMinisterOptions;
    if (isViaCouncilOfMinisters) {
      case_ = viaCouncilOfMinisterOptions.case;
      agendaItemTreatment = viaCouncilOfMinisterOptions.agendaItemTreatment;
      mandatees = viaCouncilOfMinisterOptions.mandatees;
    } else {
      case_ = this.store.createRecord('case', {
        shortTitle: publicationProperties.shortTitle,
        title: publicationProperties.longTitle,
        created: now,
      });
      await case_.save();
      agendaItemTreatment = this.store.createRecord('agenda-item-treatment', {
        startDate: notViaCouncilOfMinistersOptions.decisionDate,
      });
      await agendaItemTreatment.save();
      mandatees = [];
    }

    const initialStatus = await this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.STARTED);

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
      agendaItemTreatment: agendaItemTreatment,
      mandatees: mandatees,
      status: initialStatus,
      publicationStatusChange: statusChange,
      shortTitle: publicationProperties.shortTitle,
      longTitle: publicationProperties.longTitle,
      created: now,
      openingDate: publicationProperties.openingDate,
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

  // earliest publication date of a decision linked to first started publication activity
  async getPublicationDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const publicationActivities = (await publicationSubcase.publicationActivities).sortBy('startDate');
    if (publicationActivities.length) {
      for (let publicationActivity of publicationActivities) {
        const publishedDecisions = (await publicationActivity.decisions).sortBy('publicationDate');
        if (publishedDecisions.length) {
          return publishedDecisions.firstObject.publicationDate;
        }
      }
    }
    return undefined;
  }

  async getIsViaCouncilOfMinisters(publicationFlow) {
    const _case = await publicationFlow.case;
    const subcases = await _case.subcases;
    return !!subcases.length;
  }

  /**
 *
 * @param {PublicationFlow} publicationFlow
 * @param {{
   *  translationDueDate: Date,
   *  attachments: Piece[],
   *  subject: String,
   *  message: String,
   * }} translationRequestParams
   */
  async saveTranslationRequest(publicationFlow, translationRequestParams) {
    const translationSubcase = await publicationFlow.translationSubcase;
    const now = new Date();
    if (!translationSubcase.startDate) {
      translationSubcase.startDate = now;
    }
    translationSubcase.dueDate = translationRequestParams.translationDueDate;
    await translationSubcase.save();

    const pieces = translationRequestParams.attachments;
    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: translationSubcase,
      usedPieces: pieces,
    });
    await requestActivity.save();
    const french = await this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.FR);

    const translationActivity = this.store.createRecord('translation-activity', {
      startDate: now,
      dueDate: translationRequestParams.translationDueDate,
      title: translationRequestParams.subject,
      subcase: translationSubcase,
      requestActivity: requestActivity,
      usedPieces: pieces,
      language: french,
    });
    await translationActivity.save();

    const filePromises = pieces.mapBy('file');
    const filesPromise = Promise.all(filePromises);

    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files, outbox, mailSettings] = await Promise.all([filesPromise, outboxPromise, mailSettingsPromise]);
    const mail = await this.store.createRecord('email', {
      to: mailSettings.translationRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: translationRequestParams.subject,
      message: translationRequestParams.message,
    });
    await mail.save();
  }
}
