import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

/**
 * @argument doc Piece to show in the badge:
 * @argument isShowingAccessLevel Whether access level pill must be shown
 * @argument agendaContext Meeting/agenda/agendaitem the badge is shown for
 * @argument isHighlighted Whether badge must be highlighted
 */
export default class DcoumentsDocumentBadgeComponent extends Component {
  @service pieceAccessLevelService;

  @tracked isDraftAccessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const accessLevel = yield this.args.doc.accessLevel;
    const context = this.args.agendaContext || {};
    this.isDraftAccessLevel = yield this.pieceAccessLevelService.isDraftAccessLevel(accessLevel, context, this.args.doc);
  }
}
