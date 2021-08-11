import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
/**
 * @argument {Piece[]} pieces 'piece,piece.file'
 * @argument {String} emptyMessage message to show when there are no pieces, defaults to no documents message
 * */
export default class UtilsDocumentsListComponent extends Component {
  @service intl;

  get emptyMessage() {
    return !isBlank(this.args.emptyMessage) ? this.args.emptyMessage : this.intl.t('no-documents-available');
  }
}
