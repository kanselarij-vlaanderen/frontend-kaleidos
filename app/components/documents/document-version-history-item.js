import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';

export default class DocumentsDocumentVersionHistoryItemComponent extends Component {
  @service pieceAccessLevelService;
  
  @service intl;

  @tracked isDraftAccessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
    this.loadFiles.perform();
  }

  get labelToShow() {
    if (this.args.piece.created.getTime() == this.args.piece.modified.getTime()) {
      return this.intl.t("created-on")
    }
    return this.intl.t("edited-on")
  }

  get dateToShow() {
    if (this.args.piece.created.getTime() == this.args.piece.modified.getTime()) {
      return this.args.piece.created;
    }
    return this.args.piece.modified;
  }

  @keepLatestTask
  *loadData() {
    const accessLevel = yield this.args.piece.accessLevel;
    const context = this.args.agendaContext || {};
    this.isDraftAccessLevel = yield this.pieceAccessLevelService.isDraftAccessLevel(accessLevel, context, this.args.piece);
  }

  @keepLatestTask
  *loadFiles() {
    const sourceFile = yield this.args.piece.file;
    yield sourceFile?.derived;
  }

  @action
  changeAccessLevel(accessLevel) {
    this.args.piece.accessLevel = accessLevel;
    this.loadData.perform();
  }
}
