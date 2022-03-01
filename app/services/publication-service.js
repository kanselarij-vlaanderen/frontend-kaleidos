import Service, { inject as service } from '@ember/service';
import * as CONFIG from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

/* eslint-disable no-unused-vars */
import File from '../models/file';
import DocumentContainer from '../models/document-container';
import Piece from '../models/piece';
import PublicationFlow from '../models/publication-flow';
/* eslint-enable no-unused-vars */

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;

  async createNewPublicationFromMinisterialCouncil(
    publicationProperties,
    decisionOptions
  ) {
    return this.createNewPublication(
      publicationProperties,
      decisionOptions,
      undefined
    );
  }

  async createNewPublicationWithoutMinisterialCouncil(
    publicationProperties,
    decisionOptions
  ) {
    return this.createNewPublication(
      publicationProperties,
      undefined,
      decisionOptions
    );
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
  async createNewPublication(
    publicationProperties,
    viaCouncilOfMinisterOptions,
    notViaCouncilOfMinistersOptions
  ) {
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

    const initialStatus = await this.store.findRecordByUri(
      'publication-status',
      CONSTANTS.PUBLICATION_STATUSES.STARTED
    );

    const structuredIdentifier = this.store.createRecord(
      'structured-identifier',
      {
        localIdentifier: publicationProperties.number,
        versionIdentifier: publicationProperties.suffix,
      }
    );
    await structuredIdentifier.save();

    let identificationNumber = publicationProperties.number;
    if (
      publicationProperties.suffix &&
      publicationProperties.suffix.length > 0
    ) {
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

  async publicationNumberAlreadyTaken(
    publicationNumber,
    publicationSuffix,
    publicationFlowId
  ) {
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
    return (
      duplicates.filter((publication) => publication.id !== publicationFlowId)
        .length > 0
    );
  }

  // earliest publication date of a decision linked to first started publication activity
  async getPublicationDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const publicationActivities = (
      await publicationSubcase.publicationActivities
    ).sortBy('startDate');
    if (publicationActivities.length) {
      for (let publicationActivity of publicationActivities) {
        const publishedDecisions = (await publicationActivity.decisions).sortBy(
          'publicationDate'
        );
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

  async updatePublicationStatus(
    publicationFlow,
    targetStatusUri,
    changeDate = new Date()
  ) {
    publicationFlow.status = await this.store.findRecordByUri(
      'publication-status',
      targetStatusUri
    );
    // Continuing without awaiting here can cause saving while related status-change
    // already is deleted (by step below)
    await publicationFlow.save();

    const oldChangeActivity = await publicationFlow.publicationStatusChange;
    if (oldChangeActivity) {
      await oldChangeActivity.destroyRecord();
    }
    const newChangeActivity = this.store.createRecord(
      'publication-status-change',
      {
        startedAt: changeDate,
        publication: publicationFlow,
      }
    );
    await newChangeActivity.save();
  }

  async createProofRequestActivity(proofRequestProperties, publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const now = new Date();

    const uploadedPieces = proofRequestProperties.uploadedPieces;
    await Promise.all(
      uploadedPieces.map((piece) => {
        piece.publicationSubcaseSourceFor = publicationSubcase;
        return piece.save();
      })
    );

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      publicationSubcase: publicationSubcase,
      usedPieces: uploadedPieces,
    });
    await requestActivity.save();

    const proofingActivity = this.store.createRecord('proofing-activity', {
      startDate: now,
      title: proofRequestProperties.subject,
      subcase: publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: uploadedPieces,
    });
    await proofingActivity.save();

    const [files, outbox, mailSettings] = await Promise.all([
      Promise.all(uploadedPieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
    const mail = await this.store.createRecord('email', {
      to: mailSettings.proofRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: proofRequestProperties.subject,
      message: proofRequestProperties.message,
    });
    await mail.save();

    await this.updatePublicationStatus(
      publicationFlow,
      CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED
    );
  }

  async createPublicationRequestActivity(publicationRequestProperties, publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const now = new Date();

    const uploadedPieces = publicationRequestProperties.uploadedPieces;
    await Promise.all(
      uploadedPieces.map((piece) => {
        return piece.save();
      })
    );

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      publicationSubcase: publicationSubcase,
      usedPieces: uploadedPieces,
    });
    await requestActivity.save();

    const publicationActivity = this.store.createRecord('publication-activity', {
      startDate: now,
      title: publicationRequestProperties.subject,
      subcase: publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: uploadedPieces,
    });
    await publicationActivity.save();

    const [files, outbox, mailSettings] = await Promise.all([
      Promise.all(uploadedPieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.proofRequestToEmail,
      cc: mailSettings.proofRequestCcEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: publicationRequestProperties.subject,
      message: publicationRequestProperties.message,
    });
    await mail.save();

    await this.updatePublicationStatus(
      publicationFlow,
      CONSTANTS.PUBLICATION_STATUSES.PUBLICATION_REQUESTED
    );
  }
}
