import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaPrintableAgendaListSectionItemGroupItemDocumentListComponent extends Component {

  @use sortedPieces = resource(() => {
    const sortedPieces = new TrackedArray([]);
    const calculateSortedPieces = async () => {
      sortedPieces.length = 0;
      const pieces = await this.args.pieces?.slice();
      const piecesNoNextVersion = await Promise.all(pieces?.map(async (piece) => {
        const accessLevel = await piece.accessLevel;
        const nextPiece = await piece.nextPiece;
        if (accessLevel.uri !== CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE) {
          return !nextPiece ? piece : null; 
        }
        return null;
      }));
      const filteredPieces = piecesNoNextVersion.filter((piece) => piece !== null);
      
      // Use the filename from the filename mappings to sort
      for (const piece of pieces) {
        let mappedName;
        if (this.args.fileNameMappings) {
          mappedName = this.args.fileNameMappings.get(piece.uri);
        }

        if (mappedName) {
          piece.__name = piece.name;
          piece.name = mappedName;
        }
      }

      (await sortPieces(filteredPieces))
        .forEach((piece) => sortedPieces.push(piece));

      // Restore the piece's filename
      for (const piece of pieces) {
        if (piece.__name) {
          piece.name = piece.__name;
          delete piece.__name;
        }
      }
    };
    calculateSortedPieces();
    return sortedPieces;
  });
}
