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

    const publicationFlow = this.store.createRecord('publication-flow', {
      identification: identifier,
      case: case_,
      agendaItemTreatment: agendaItemTreatment,
      mandatees: mandatees,
      status: initialStatus,
      shortTitle: publicationProperties.shortTitle,
      longTitle: publicationProperties.longTitle,
      created: now,
      openingDate: publicationProperties.openingDate,
      modified: now,
      regulationType: regulationType,
    });
    await publicationFlow.save();

    const statusChange = this.store.createRecord('publication-status-change', {
      startedAt: now,
      publication: publicationFlow,
    });
    await statusChange.save();

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
    changeDate = new Date(),
    decision
  ) {
    const translationReceivedStatus = await this.store.findRecordByUri(
      'publication-status',
      CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_RECEIVED
    );

    const previousStatus = publicationFlow.status;
    const status = await this.store.findRecordByUri(
      'publication-status',
      targetStatusUri
    );

    // update status
    publicationFlow.status = status;

    //undo changes when going to a previous state
    if (status.position < previousStatus.position) {
      if (status.position < translationReceivedStatus.position) {
        const translationSubcase = await publicationFlow.translationSubcase;
        if (translationSubcase.endDate) {
          translationSubcase.endDate = null;
          await translationSubcase.save();
        }
      }
      if (previousStatus.isFinal) {
        this.args.publicationFlow.closingDate = null;
        const publicationSubcase = await publicationFlow.publicationSubcase;
        if (publicationSubcase.endDate) {
          publicationSubcase.endDate = null;
          await publicationSubcase.save();
        }
      }
      // remove decision if "published" status is reverted and it's not a Staatsblad resource
      if (
        previousStatus.isPublished &&
        !status.isPublished &&
        !decision.isStaatsbladResource
      ) {
        await decision.destroyRecord();
        decision = undefined;
      }
    }

    // update end date if status is "translation received" or further
    if (
      status.position >= translationReceivedStatus.position &&
      !status.isPaused
    ) {
      const translationSubcase = await publicationFlow.translationSubcase;
      if (!translationSubcase.endDate) {
        translationSubcase.endDate = changeDate;
        await translationSubcase.save();
      }
    }

    // update closing dates of auxiliary activities if status is "published"
    if (status.isFinal) {
      this.args.publicationFlow.closingDate = changeDate;

      const publicationSubcase = await publicationFlow.publicationSubcase;
      if (!publicationSubcase.endDate) {
        publicationSubcase.endDate = changeDate;
        await publicationSubcase.save();
      }

      // create decision for publication activity when status changed to "published"
      if (status.isPublished && !decision) {
        let publicationActivities =
          await publicationSubcase.publicationActivities;
        // (sortBy converts to array)
        publicationActivities = publicationActivities.sortBy('-startDate');
        let publicationActivity = publicationActivities[0];

        if (!publicationActivity) {
          publicationActivity = this.store.createRecord(
            'publication-activity',
            {
              subcase: publicationSubcase,
              endDate: changeDate,
            }
          );
          await publicationActivity.save();
        }

        decision = this.store.createRecord('decision', {
          publicationActivity: publicationActivity,
          publicationDate: changeDate,
        });
        await decision.save();
      }
    } else {
      publicationFlow.closingDate = null;
    }

    // Continuing without awaiting here can cause saving while related status-change
    // already is deleted (by step below)
    await publicationFlow.save();

    // reload the relation for possible concurrency
    const currentStatusChange = await publicationFlow
      .belongsTo('publicationStatusChange')
      .reload();
    await currentStatusChange?.destroyRecord();
    const newStatusChange = this.store.createRecord(
      'publication-status-change',
      {
        startedAt: changeDate,
        publication: publicationFlow,
      }
    );
    await newStatusChange.save();
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
      replyTo: mailSettings.proofRequestReplyToEmail,
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
      replyTo: mailSettings.publicationRequestReplyToEmail,
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
    await file.destroyRecord();
    await documentContainer.destroyRecord();
    await piece.destroyRecord();
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
