import Component from '@glimmer/component';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class AgendaPrintableAgendaListSectionItemGroupItemDocumentListComponent extends Component {

  get sortedPieces() {
    return sortPieces(this.args.pieces.toArray());
  }
}
