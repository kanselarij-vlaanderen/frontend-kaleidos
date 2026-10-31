import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

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
    if (this.args.piece.created?.getTime() == this.args.piece.modified?.getTime()) {
      return this.intl.t("created-on")
    }
    return this.intl.t("edited-on")
  }

  get dateToShow() {
    if (this.args.piece.created?.getTime() == this.args.piece.modified?.getTime()) {
      return this.args.piece.created;
    }
    return this.args.piece.modified;
  }

  loadData = task({ keepLatest: true }, async () => {
    const accessLevel = await this.args.piece.accessLevel;
    const context = this.args.agendaContext || {};
    this.isDraftAccessLevel = await this.pieceAccessLevelService.isDraftAccessLevel(accessLevel, context, this.args.piece);
  });

  loadFiles = task({ keepLatest: true }, async () => {
    const sourceFile = await this.args.piece.file;
    await sourceFile?.derived;
  });

  @action
  changeAccessLevel(accessLevel) {
    this.args.piece.accessLevel = accessLevel;
    this.loadData.perform();
  }
}
