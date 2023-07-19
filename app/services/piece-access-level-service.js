import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

/*
 * This service is used to make necessary changes to access levels of certain pieces when an access level
 * or confidentiality of a piece, subcase, ... is edited.
 */
export default class PieceAccessLevelService extends Service {
  @service agendaService;
  @service store;
  @service currentSession;

/*
 * This method is used to update the access levels of the previous version of a piece.
 *
 * - When the access level is changed to "Intern secretarie", the previous access
 *   level is set to "Intern secretarie".
 * - When the access level is changed to "Vertrouwelijk", the previous access
 *   level is set to "Vertrouwelijk", unless it was "Intern secretarie", then it
 *   is not changed.
 * - When the access level is changed to any other access level, the previous
 *   access level is set to "Intern regering", unless an it was
 *   "Intern secretarie" or "Vertrouwelijk", then it is not changed.
 *
 * Or in a table:
 * +----------------------------------------------+------------------------------------------+
 * | When the current access level is changed to… | The previous access level is changed to… |
 * +----------------------------------------------+------------------------------------------+
 * | Publiek                                      | Intern Regering                          |
 * | Intern Overheid                              | Intern Regering                          |
 * | Intern Regering                              | Intern Regering                          |
 * | Vertrouwelijk                                | Vertrouwelijk                             |
 * | Intern Secretarie                            | Intern Secretarie                        |
 * +----------------------------------------------+------------------------------------------+
 *
 * Function returns true if further pieces should be processed, false if not
 * (e.g. if an access level of "Intern secretarie" was found further access levels
 * shouldn't be processed).
 */
  async updatePreviousAccessLevel(piece) {
    const internSecretarie = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE);
    const vertrouwelijk = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK);
    const internRegering = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);

    const accessLevel = await piece.accessLevel;

    const previousPiece = await piece.previousPiece;
    if (!previousPiece) {
      return false;
    }

    const previousAccessLevel = await previousPiece.accessLevel;
    if (previousAccessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE) {
      return false;
    }

    if (previousAccessLevel.uri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        && !(accessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE)) {
      return false;
    }

    switch (accessLevel.uri) {
      case CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE:
        previousPiece.accessLevel = internSecretarie;
        break;
      case CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK:
        previousPiece.accessLevel = vertrouwelijk;
        break;
      default:
        previousPiece.accessLevel = internRegering;
    }
    await previousPiece.save();
    return true;
  }

  /** Same as above, but apply to all previous pieces.
   */
  async updatePreviousAccessLevels(piece) {
    while (piece) {
      if (await this.updatePreviousAccessLevel(piece)) {
        piece = await piece.previousPiece;
      } else {
        piece = null;
      }
    }
  }

  /**
   * Strengthen the access level of the piece to intern regering (unless the
   * access level was already this level or higher) and then update all the previous access
   * levels.
   */
  async strengthenAccessLevelToInternRegering(piece) {
    const accessLevel = await piece.accessLevel;
    if (
      ![
        CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
        CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
        CONSTANTS.ACCESS_LEVELS.INTERN_REGERING,
      ].includes(accessLevel.uri)
    ) {
      const internRegering = await this.store.findRecordByUri(
        'concept',
        CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
      );
      piece.accessLevel = internRegering;
      await piece.save();
      await this.updatePreviousAccessLevels(piece);
    }
  }

  /**
   * Strengthen the access level of the piece to vertrouwelijk (unless the
   * access level was already this level or higher) and then update all the previous access
   * levels.
   */
  async strengthenAccessLevelToConfidential(piece) {
    const accessLevel = await piece.accessLevel;
    if(
      ![
        CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
        CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
      ].includes(accessLevel.uri)
    ) {
      const confidential = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK);
      piece.accessLevel = confidential;
      await piece.save();
      await this.updatePreviousAccessLevels(piece);
    }
  }

  /*
   * This method is used to update the access levels of the reports related to a subcase's decision-activity.
   * When a subcase has been updated to being confidential, all the reports of the decision-activity get the
   * "Vertrouwelijk" access level.
   */
  async updateDecisionsAccessLevelOfSubcase(subcase) {
    const reports = await this.store.query('report', {
      'filter[decision-activity][subcase][:id:]': subcase.id,
      include: 'access-level',
    });

    await Promise.all(reports.slice().map(async (report) => {
      await this.strengthenAccessLevelToConfidential(report);
    }));
  }

    /*
   * This method is used to update the access levels of the documents related to of a subcase's submission-activity.
   * When a subcase has been updated to being confidential, all the documents of the submission-activity get the
   * "Vertrouwelijk" access level.
   */

  async updateSubmissionAccessLevelOfSubcase(subcase) {
    const pieces = await this.store.query('piece', {
      'filter[submission-activity][subcase][:id:]': subcase.id,
      'filter[:has-no:next-piece]': true,
      'page[size]': PAGE_SIZE.PIECES,
    });
    
    await Promise.all(pieces.slice().map(async (piece) => {
      await this.strengthenAccessLevelToConfidential(piece);
    }));
  }

  /*
   * Returns whether the given access level already applies in the given agenda-context.
   * I.e. whether the document has already been propagated based on the access-level
   * or if propagation still needs to be executed at a later time.
   * E.g. a public document is publicly available only after the documents of a meeting
   * have been published on Themis, even though it is already marked as public in Kaleidos before.
  */
  async isDraftAccessLevel(accessLevel, { meeting, agenda, agendaitem }, piece) {
    if (
      [accessLevel, meeting, agenda, piece].includes(undefined) ||
      [accessLevel, meeting, agenda, piece].includes(null)
    ) {
      // Propagation status is based on agenda-related rules.
      // If any of the arguments is undefined, this access level is not related
      // to an agenda so it will always be in non-draft status.
      return false;
    } else {
      if (accessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE) {
        // no propagation required, so never in draft
        return false;
      } else if (accessLevel.uri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK) {
        // draft iff:
        // - design-agenda without previous version
        // - new document on an agendaitem of a design agenda with a previous version
        const isDesignAgenda = (await agenda.status).isDesignAgenda;
        if (isDesignAgenda) {
          const previousAgenda = await agenda.previousVersion;
          if (previousAgenda) {
            if (agendaitem) {
              const newPiecesOnAgenda = await this.agendaService.changedPieces(
                agenda.id,
                previousAgenda.id,
                agendaitem.id
              );
              return newPiecesOnAgenda.includes(piece);
            } else {
              return false; // document not related to an agendaitem. Eg. agenda documents
            }
          } else {
            return true;
          }
        } else {
          return false;
        }
      } else if (accessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_REGERING) {
        // draft iff decisions are not yet released internally
        const decisionPublicationActivity = await meeting.internalDecisionPublicationActivity;
        const status = await decisionPublicationActivity.status;
        return status.uri != CONSTANTS.RELEASE_STATUSES.RELEASED;
      } else if (accessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID) {
        // draft iff documents are not yet released internally
        const documentPublicationActivity = await meeting.internalDocumentPublicationActivity;
        const status = await documentPublicationActivity.status;
        return status.uri != CONSTANTS.RELEASE_STATUSES.RELEASED;
      } else if (accessLevel.uri === CONSTANTS.ACCESS_LEVELS.PUBLIEK) {
        // draft iff no released themis-publication-activity with scope documents yet
        const nbOfDocumentPublications = await this.store.count('themis-publication-activity', {
          'filter[meeting][:uri:]': meeting.uri,
          'filter[scope]': CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS,
          'filter[status][:uri:]': CONSTANTS.RELEASE_STATUSES.RELEASED,
        });
        return nbOfDocumentPublications === 0;
      } else {
        return false;
      }
    }
  }

  async canViewConfidentialPiece(piece) {
    const accessLevel = await piece?.accessLevel;
    if (this.currentSession.may('view-only-specific-confidential-documents') && accessLevel?.uri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK) {
      const submissionActivity = await this.store.queryOne('submission-activity', {
        filter: {
          pieces: {
            ':id:': piece?.id,
          },
        },
      });
      let subcase;
      if (submissionActivity) {
        subcase = await submissionActivity.subcase;
      } else {
        const decisionActivity = await this.store.queryOne('decision-activity', {
          filter: {
            report: {
              ':id:': piece?.id,
            },
          },
        });
        if (decisionActivity) {
          subcase = await decisionActivity.subcase;
        }
      }
      if (subcase) {
        const mandatees = await subcase.mandatees;
        const currentUserOrganization = await this.currentSession.organization;
        const currentUserOrganizationMandatees = await currentUserOrganization.mandatees;
        const mandateeUris = mandatees.map((mandatee) => mandatee.uri);
        const currentUserOrganizationMandateesUris = currentUserOrganizationMandatees.map((mandatee) => mandatee.uri);
        for (const orgMandateeUri of currentUserOrganizationMandateesUris) {
          if (mandatees.length && mandateeUris.includes(orgMandateeUri)) {
            return true;
          }
        }
      }
    } else {
      // default to standard behaviour (if confidential doc is in your graph it can be accessed normally)
      return true;
    }
    return false;
  }
}
