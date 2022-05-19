import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PiecesService extends Service {
  @service store;

  async updatePreviousAccessLevels(piece) {
    const internSecretarie = this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE);
    const ministerraad = this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.MINISTERRAAD);
    const internRegering = this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);

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
