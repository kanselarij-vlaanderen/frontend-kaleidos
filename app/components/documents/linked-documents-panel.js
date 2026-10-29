import Component from '@glimmer/component';
import { service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { removeObject, removeObjects } from 'frontend-kaleidos/utils/array-helpers';

export default class DocumentsLinkedDocumentsComponent extends Component {
  @service store;

  @tracked isOpenLinkedPieceModal = false;
  @tracked linkedPieces = new TrackedArray([]);
  @tracked newLinkedPieces = new TrackedArray([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    this.linkedPieces = await this.args.agendaitemOrSubcase.linkedPieces;
  });

  get itemType() {
    return this.args.agendaitemOrSubcase && this.args.agendaitemOrSubcase.constructor.modelName;
  }

  @action
  openLinkedPieceModal() {
    this.isOpenLinkedPieceModal = true;
  }

  @action
  cancelLinkPieces() {
    this.newLinkedPieces = new TrackedArray([]);
    this.isOpenLinkedPieceModal = false;
  }

  @action
  linkPiece(piece) {
    this.newLinkedPieces.push(piece);
  }

  @action
  unlinkPiece(piece) {
    removeObject(this.newLinkedPieces, piece);
  }

  saveLinkedPieces = task(async () => {
    let allPiecesToLink = [];
    for (const linkedPiece of this.newLinkedPieces) {
      const linkedPieces = await this.store.query('piece', {
        'filter[document-container][pieces][:id:]': linkedPiece.get('id'),
        page: {
          size: 300,
        },
      });
      allPiecesToLink = [...allPiecesToLink, ...linkedPieces.slice()];
    }

    if (allPiecesToLink.length) {
      if (this.itemType === 'agendaitem') {
        // Link pieces to subcase related to the agendaitem
        const agendaActivity = await this.args.agendaitemOrSubcase.agendaActivity;
        if (agendaActivity) {
          const subcase = await agendaActivity.subcase;
          let subcasePieces = await subcase.hasMany('linkedPieces').reload();
          subcasePieces = subcasePieces.slice();
          subcasePieces.push(...allPiecesToLink);
          subcase.linkedPieces = subcasePieces;
          await subcase.save();
        }
      } else if (this.itemType === 'subcase') {
        // Link pieces to all agendaitems that are related to the subcase via an agendaActivity
        // and related to an agenda in the design status
        const agendaitems = await this.store.query('agendaitem', {
          'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
          'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
        });
        const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
          let agendaitemPieces = await agendaitem.hasMany('linkedPieces').reload();
          agendaitemPieces = agendaitemPieces.slice();
          agendaitemPieces.push(...allPiecesToLink);
          agendaitem.linkedPieces = agendaitemPieces;
          await agendaitem.save();
        });
        await all(agendaitemUpdates);
      }

      // Link pieces to subcase/agendaitem
      let newLinkedPieces = await this.args.agendaitemOrSubcase.hasMany('linkedPieces').reload();
      newLinkedPieces = newLinkedPieces.slice();
      newLinkedPieces.push(...allPiecesToLink);
      this.args.agendaitemOrSubcase.linkedPieces = newLinkedPieces;
      await this.args.agendaitemOrSubcase.save();
      this.linkedPieces = newLinkedPieces;
    }

    this.newLinkedPieces = new TrackedArray([]);
    this.isOpenLinkedPieceModal = false;
  });

  unlinkDocumentContainer = task(async (documentContainer) => {
    const linkedPiecesToRemove = (await documentContainer.pieces).slice();

    if (this.itemType === 'agendaitem') {
      // Unlink pieces from subcase related to the agendaitem
      const agendaActivity = await this.args.agendaitemOrSubcase.agendaActivity;
      if (agendaActivity) {
        const subcase = await agendaActivity.subcase;
        let subcasePieces = await subcase.hasMany('linkedPieces').reload();
        subcasePieces = subcasePieces.slice();
        removeObjects(subcasePieces, linkedPiecesToRemove);
        subcase.linkedPieces = subcasePieces;
        await subcase.save();
      }
    } else if (this.itemType === 'subcase') {
      // Unlink pieces from all agendaitems that are related to the subcase via an agendaActivity
      // and related to an agenda in the design status
      const agendaitems = await this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
        'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
      });
      const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
        let agendaitemPieces = await agendaitem.hasMany('linkedPieces').reload();
        agendaitemPieces = agendaitemPieces.slice();
        removeObjects(agendaitemPieces, linkedPiecesToRemove);
        agendaitem.linkedPieces = agendaitemPieces;
        await agendaitem.save();
      });
      await all(agendaitemUpdates);
    }

    // Unlink pieces from subcase/agendaitem
    let newLinkedPieces = await this.args.agendaitemOrSubcase.hasMany('linkedPieces').reload();
    newLinkedPieces = newLinkedPieces.slice();
    removeObjects(newLinkedPieces, linkedPiecesToRemove);
    this.args.agendaitemOrSubcase.linkedPieces = newLinkedPieces;
    await this.args.agendaitemOrSubcase.save();
    this.linkedPieces = newLinkedPieces;
  });
}