import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class AgendaPrintableAgendaListSectionItemGroupItemDocumentListComponent extends Component {

  @use sortedPieces = resource(() => {
    const sortedPieces = new TrackedArray([]);
    const calculateSortedPieces = async () => {
      sortedPieces.length = 0;
      const pieces = await this.args.pieces;
      sortPieces(pieces)
        .forEach((piece) => sortedPieces.push(piece));
    };
    calculateSortedPieces();
    return sortedPieces;
  });
}
