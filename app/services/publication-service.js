import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import { isEmpty } from '@ember/utils';

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
   *  decisionActivity: DecisionActivity,
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

    let _case;
    let governmentAreas;
    let decisionActivity;
    let mandatees;
    let regulationType;
    const isViaCouncilOfMinisters = !!viaCouncilOfMinisterOptions;
    if (isViaCouncilOfMinisters) {
      _case = viaCouncilOfMinisterOptions.case;
      decisionActivity = viaCouncilOfMinisterOptions.decisionActivity;
      mandatees = viaCouncilOfMinisterOptions.mandatees;
      regulationType = viaCouncilOfMinisterOptions.regulationType;

      const decisionmakingFlow = await _case.decisionmakingFlow;
      const latestSubcase = await this.store.queryOne('subcase', {
        filter: {
          'decisionmaking-flow': {
            ':id:': decisionmakingFlow.id,
          }
        },
        sort: '-created',
      });
      governmentAreas = await latestSubcase.governmentAreas;
    } else {
      _case = this.store.createRecord('case', {
        shortTitle: publicationProperties.shortTitle,
        title: publicationProperties.longTitle,
        created: now,
      });
      await _case.save();
      decisionActivity = this.store.createRecord('decision-activity', {
        startDate: notViaCouncilOfMinistersOptions.decisionDate,
      });
      await decisionActivity.save();
      mandatees = [];
      governmentAreas = [];
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

    const standardUrgencyLevel = await this.store.findRecordByUri(
      'urgency-level',
      CONSTANTS.URGENCY_LEVELS.STANDARD,
    );

    const publicationFlow = this.store.createRecord('publication-flow', {
      identification: identifier,
      case: _case,
      decisionActivity: decisionActivity,
      mandatees: mandatees,
      status: initialStatus,
      shortTitle: publicationProperties.shortTitle,
      longTitle: publicationProperties.longTitle,
      numberOfExtracts: 1,
      created: now,
      openingDate: publicationProperties.openingDate,
      modified: now,
      regulationType: regulationType,
      urgencyLevel: standardUrgencyLevel,
      governmentAreas: governmentAreas,
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
    // Not using the query below since a bug in mu-cache/mu-cl-resources
    // doesn't invalidate the cache entry when a publication gets linked
    // to an agendaitem. As a workaround querying via agenda-item-treatment id
    // for now.

    // const agendaitem = await this.store.queryOne('agendaitem', {
    //   'filter[treatment][decision-activity][publication-flows][:id:]': publicationFlow.id,
    // });

    const _case = await publicationFlow.case;
    const decisionmakingFlow = await _case.decisionmakingFlow;
    return decisionmakingFlow != null;
  }

  async updatePublicationStatus(publicationFlow, targetStatusUri, changeDate) {
    if (isEmpty(changeDate)) {
      changeDate = new Date();
    }

    const previousStatus = await publicationFlow.status;
    const targetStatus = await this.store.findRecordByUri(
      'publication-status',
      targetStatusUri
    );
    const translationSubcase = await publicationFlow.translationSubcase;
    const publicationSubcase = await publicationFlow.publicationSubcase;

    const translationReceivedStatus = await this.store.findRecordByUri(
      'publication-status',
      CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_RECEIVED
    );

    // Update intermediate end-dates when status progresses
    if (!targetStatus.isPaused) {
      if (targetStatus.position > previousStatus.position || previousStatus.isPaused) {
        // Set end-date on translation subcase if 'translation-received' status is passed
        if (targetStatus.position >= translationReceivedStatus.position) {
          if (!translationSubcase.endDate) {
            translationSubcase.endDate = changeDate;
          }
          // else: endDate has already been set on translation subcase
        }
      }
    }

    // Undo changes when status gets reverted
    if (targetStatus.position < previousStatus.position || previousStatus.isPaused) {
      // Undo end-date on translation-subcase if reverted before 'translation-received'
      if (targetStatus.position < translationReceivedStatus.position) {
        translationSubcase.endDate = null;
      }
    }

    // Update closing date(s) if final status is reached
    if (targetStatus.isFinal) {
      publicationFlow.closingDate = changeDate;
      publicationSubcase.endDate = changeDate;
    } else {
      publicationFlow.closingDate = null;
      publicationSubcase.endDate = null;
    }

    // Create decision for publication activity when status changes to 'published'
    if (targetStatus.isPublished) {
      await this.ensureDecision(publicationSubcase, changeDate);
    }

    // Remove decision if 'published' status is reverted and it's not a Staatsblad resource
    if (previousStatus.isPublished) {
      const decision = await this.store.queryOne('decision', {
        'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
        sort: 'publication-activity.start-date,publication-date',
      });

      if (decision && !decision.isStaatsbladResource) {
        await decision.destroyRecord();
      }
    }

    // Update publication status
    publicationFlow.status = targetStatus;

    const savePromises = [publicationFlow.save()];
    if (translationSubcase.hasDirtyAttributes) {
      savePromises.push(translationSubcase.save());
    }
    if (publicationSubcase.hasDirtyAttributes) {
      savePromises.push(publicationSubcase.save());
    }
    // Await save to avoid conflicts on destroy of
    // publication-status-change in next step
    await Promise.all(savePromises);

    // Update publication-status-change
    // Reload relation before destroying for possible concurrency
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
   * @param {DecisionActivity} decisionActivity
   * @returns [meetingId, agendaId, agendaitemId] an array of id's for a linkTo to route "agenda.agendaitems.agendaitem"
   */
  async getModelsForAgendaitemFromDecisionActivity(decisionActivity) {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[treatment][decision-activity][:id:]': decisionActivity.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    const agenda = await agendaitem?.agenda;
    const meeting = await agenda?.createdFor;
    return [meeting?.id, agenda?.id, agendaitem?.id];
  }

  async ensureDecision(publicationSubcase, date) {
    let decision = await this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });

    if (!decision) {
      const publicationActivities = await publicationSubcase.publicationActivities;
      let publicationActivity = publicationActivities.sortBy('-startDate')?.[0];

      if (!publicationActivity) {
        publicationActivity = this.store.createRecord(
          'publication-activity',
          {
            subcase: publicationSubcase,
            endDate: date,
          }
        );
        await publicationActivity.save();
      }

      decision = this.store.createRecord('decision', {
        publicationActivity: publicationActivity,
        publicationDate: date,
      });
      await decision.save();
    }

    return decision;
  }
}
