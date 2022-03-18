import Service, { inject as service } from '@ember/service';
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
    let regulationType;
    const isViaCouncilOfMinisters = !!viaCouncilOfMinisterOptions;
    if (isViaCouncilOfMinisters) {
      case_ = viaCouncilOfMinisterOptions.case;
      agendaItemTreatment = viaCouncilOfMinisterOptions.agendaItemTreatment;
      mandatees = viaCouncilOfMinisterOptions.mandatees;
      regulationType = viaCouncilOfMinisterOptions.regulationType;
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
      regulationType: regulationType,
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

  /**
   * @param {{
   *  pieces: Piece[],
   *  subject: string,
   *  message: string
   * }} proofRequestProperties
   * @param {PublicationFlow} publicationFlow
   */
  async createProofRequest(proofRequestProperties, publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const now = new Date();
    const pieces = proofRequestProperties.pieces;

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      publicationSubcase: publicationSubcase,
      usedPieces: pieces,
    });
    await requestActivity.save();

    const proofingActivity = this.store.createRecord('proofing-activity', {
      startDate: now,
      title: proofRequestProperties.subject,
      subcase: publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: pieces,
    });
    await proofingActivity.save();

    const [files, outbox, mailSettings] = await Promise.all([
      Promise.all(pieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
    const mail = await this.store.createRecord('email', {
      to: mailSettings.proofRequestToEmail,
      cc: mailSettings.proofRequestCcEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: proofRequestProperties.subject,
      message: proofRequestProperties.message,
    });
    await mail.save();

    if (proofRequestProperties.mustUpdatePublicationStatus) {
      await this.updatePublicationStatus(
        publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED
      );
    }
  }

  /**
   * @param {{
   *  pieces: Piece[],
   *  subject: string,
   *  message: string
   * }} publicationRequestProperties
   * @param {PublicationFlow} publicationFlow
   */
  async createPublicationRequest(
    publicationRequestProperties,
    publicationFlow
  ) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const now = new Date();
    const pieces = publicationRequestProperties.pieces;

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      publicationSubcase: publicationSubcase,
      usedPieces: pieces,
    });
    await requestActivity.save();

    const publicationActivity = this.store.createRecord(
      'publication-activity',
      {
        startDate: now,
        title: publicationRequestProperties.subject,
        subcase: publicationSubcase,
        requestActivity: requestActivity,
        usedPieces: pieces,
      }
    );
    await publicationActivity.save();

    const [files, outbox, mailSettings] = await Promise.all([
      Promise.all(pieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.publicationRequestToEmail,
      cc: mailSettings.publicationRequestCcEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: publicationRequestProperties.subject,
      message: publicationRequestProperties.message,
    });
    await mail.save();

    if (publicationRequestProperties.mustUpdatePublicationStatus) {
      await this.updatePublicationStatus(
        publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PUBLICATION_REQUESTED
      );
    }
  }

  /**
   * Create and save:
   * - piece
   * - document-container without versioning
   * @param {File} file
   * @param {{
   *  name: string,
   * }}
   * @returns {Piece}
   */
  async createPiece(file) {
    const documentContainer = this.store.createRecord('document-container', {
      created: file.created,
    });
    await documentContainer.save();

    const piece = this.store.createRecord('piece', {
      created: file.created,
      modified: file.created,
      name: file.filenameWithoutExtension,
      file: file,
      documentContainer: documentContainer,
    });
    await piece.save();

    return piece;
  }

  /**
   * Delete and save:
   * - piece
   * - file
   * - document-container without versioning
   * @param {Piece} piece
   */
  async deletePiece(piece) {
    const file = await piece.file;
    const documentContainer = await piece.documentContainer;
    await Promise.all([
      piece.destroyRecord(),
      file.destroyRecord(),
      documentContainer.destroyRecord(),
    ]);
  }

  /**
   * For publications, we want to show a link to the agendaitem but loading the models agendaitem/agenda/meeting should be avoided.
   * Mainly because some of the relations should be loaded a certain way and we just want to generate a link, not work with the models.
   * 
   * @param {AgendaItemTreatment} agendaItemTreatment 
   * @returns [meetingId, agendaId, agendaitemId] an array of id's for a linkTo to route "agenda.agendaitems.agendaitem"
   */
  async getModelsForAgendaitemFromTreatment(agendaItemTreatment) {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[treatments][:id:]': agendaItemTreatment.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    const agenda = await agendaitem?.agenda;
    const meeting = await agenda?.createdFor;
    return [meeting.id, agenda.id, agendaitem.id];
  }
}
