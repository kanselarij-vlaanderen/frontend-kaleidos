import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/*
 * This service is used to update the access levels of the previous version of a piece.
 * Only previous pieces are updated, next pieces are left unchanged.
 *
 * - When the access level is changed to "Intern secretarie", all previous access levels are set to "Intern secretarie".
 * - When the access level is changed to "Ministerraad", all previous access levels are set to "Ministerraad",
 *   unless an access level is encountered that was "Intern secretarie", then the function halts.
 * - When the access level is changed to any other access level, all previous access levels are set to "Intern regering",
 *   unless an access level is encountered that was "Intern secretarie" or "Ministerraad", then the function halts.
 *
 * Or in a table:
 * +----------------------------------------------+------------------------------------------+
 * | When the current access level is changed to… | The previous access level is changed to… |
 * +----------------------------------------------+------------------------------------------+
 * | Publiek                                      | Intern Regering                          |
 * | Intern Overheid                              | Intern Regering                          |
 * | Intern Regering                              | Intern Regering                          |
 * | Ministerraad                                 | Ministerraad                             |
 * | Intern Secretarie                            | Intern Secretarie                        |
 * +----------------------------------------------+------------------------------------------+
 *
 * The reason for halting when encountering an access level that does not need to be changed, is that normally all other
 * pieces encountered also won't need changing.
 */
export default class PieceAccessLevelService extends Service {
  @service store;

  async updatePreviousAccessLevels(piece) {
    const internSecretarie = await this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE);
    const ministerraad = await this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.MINISTERRAAD);
    const internRegering = await this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);

    const accessLevel = await piece.accessLevel;

    let previousPiece = await piece.previousPiece;
    while (previousPiece) {
      const previousAccessLevel = await previousPiece.accessLevel;
      if (previousAccessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE) {
        break;
      }

      if (previousAccessLevel.uri === CONSTANTS.ACCESS_LEVELS.MINISTERRAAD
          && !(accessLevel.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE)) {
        break;
      }

      switch (accessLevel.uri) {
        case CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE:
          previousPiece.accessLevel = internSecretarie;
          break;
        case CONSTANTS.ACCESS_LEVELS.MINISTERRAAD:
          previousPiece.accessLevel = ministerraad;
          break;
        default:
          previousPiece.accessLevel = internRegering;
      }
      await previousPiece.save();

      previousPiece = await previousPiece.previousPiece;
    }
  }
}
