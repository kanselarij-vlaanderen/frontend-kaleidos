import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/*
 * This service is used to make necessary changes to access levels of certain pieces when an access level
 * or confidentiality of a piece, subcase, ... is edited.
 */
export default class PieceAccessLevelService extends Service {
  @service store;

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
   * access level was already higher) and then update all the previous access
   * levels.
   */
  async strengthenAccessLevelToInternRegering(piece) {
    const accessLevel = await piece.accessLevel;
    if (![CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE, CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK].includes(accessLevel.uri)) {
      const internRegering = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
      piece.accessLevel = internRegering;
      await piece.save();

      await this.updatePreviousAccessLevels(piece);
    }
  }

  /*
   * This method is used to update the access levels of the reports related to of a subcase's decision-activity.
   * When a subcase has been updated to being confidential, all the reports of the decision-activity get the
   * "Vertrouwelijk" access level.
   */
  async updateDecisionsAccessLevelOfSubcase(subcase) {
    const vertrouwelijk = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK);
    const pieces = await this.store.query('piece', {
      'filter[decision-activity][subcase][:id:]': subcase.id,
      include: 'access-level',
    });

    await Promise.all(pieces.toArray().map(async (piece) => {
      const accessLevel = await piece.accessLevel;
      if (accessLevel.uri !== vertrouwelijk.uri) {
        piece.accessLevel = vertrouwelijk;
        return piece.save();
      }
    }));
  }
}
