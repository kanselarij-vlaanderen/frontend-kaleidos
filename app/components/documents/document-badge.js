import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

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

  loadData = task({ keepLatest: true }, async () => {
    const accessLevel = await this.args.doc.accessLevel;
    const context = this.args.agendaContext || {};
    this.isDraftAccessLevel = await this.pieceAccessLevelService.isDraftAccessLevel(accessLevel, context, this.args.doc);
  });
}
